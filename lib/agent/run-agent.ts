import { HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { toUIMessageStream } from "@ai-sdk/langchain";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessageChunk,
} from "ai";
import {
  filterUserFacingActions,
  selectionActionsFromInteraction,
} from "@/lib/chat-interactions";
import {
  isConversationalQuery,
  isLikelyAddressQuery,
  suggestFollowUpActions,
  type ChatHistoryItem,
  friendlyChatError,
} from "@/lib/chat-intent";
import type { ChatIdentity } from "@/lib/auth/optional-user";
import { getMemoryContext, mergeSessionMemoryToUser, storeConversation } from "@/lib/supermemory";
import { buildClientPayload } from "./middleware";
import { getNestAgent } from "./graph";
import type { NestAgentGraphState } from "./state";
import type { NestResponse } from "./response-schema";

export type AgentStreamOptions = {
  identity: ChatIdentity;
  userMessage?: string;
  resume?: {
    optionId: string;
    kind: string;
    optionMeta?: Record<string, unknown>;
  };
};

function messageFromInteractionState(state: NestAgentGraphState): string | null {
  const interaction = state.lastInteraction;
  if (!interaction) return null;
  if (interaction.status === "needs_selection") return interaction.message;
  if (
    interaction.status === "not_found" ||
    interaction.status === "invalid_input" ||
    interaction.status === "error" ||
    interaction.status === "blocked"
  ) {
    return interaction.message;
  }
  return null;
}

function resolveActions(
  structured: NestResponse | undefined,
  userMessage: string,
  state: NestAgentGraphState,
): string[] {
  const client = buildClientPayload(state);
  if (client.interaction?.status === "needs_selection") {
    return selectionActionsFromInteraction(client.interaction);
  }

  if (structured?.actions?.length) {
    return filterUserFacingActions(structured.actions).slice(0, 4);
  }

  const history: ChatHistoryItem[] = [];
  return suggestFollowUpActions(userMessage, history, {
    hasProperty: Boolean(state.propertyLookup),
  });
}

function resolveMessage(
  structured: NestResponse | undefined,
  state: NestAgentGraphState,
): string {
  const interactionMessage = messageFromInteractionState(state);
  if (interactionMessage) return interactionMessage;
  if (structured?.message) return structured.message;

  const messages = state.messages as { content?: unknown }[];
  const last = messages[messages.length - 1];
  if (last && typeof last.content === "string") return last.content;
  return "I'm here to help with DSCR — what would you like to know?";
}

function shouldPrefetchMemory(identity: ChatIdentity, query: string): boolean {
  if (!process.env.SUPERMEMORY_API_KEY?.trim()) return false;
  const q = query.trim();
  if (!q) return false;
  // FAQ-style turns skip blocking Supermemory; agent can call recall_user_context if needed.
  if (isConversationalQuery(q) && !isLikelyAddressQuery(q)) return false;
  return true;
}

async function prepareMemory(identity: ChatIdentity, query: string) {
  if (identity.userId) {
    void mergeSessionMemoryToUser(identity.sessionId, identity.userId);
  }
  if (!shouldPrefetchMemory(identity, query)) return "";
  return getMemoryContext(identity.memoryContainer, query);
}

const ASSISTANT_TEXT_ID = "nest-response";

/** Tracks whether assistant text was already emitted during streaming. */
type TextEmittedFlag = { value: boolean };

function parseStructuredToolOutput(output: unknown): NestResponse | null {
  let raw: unknown = output;
  if (typeof output === "string") {
    try {
      raw = JSON.parse(output);
    } catch {
      return null;
    }
  }
  if (typeof raw !== "object" || raw === null) return null;

  const obj = raw as Record<string, unknown>;
  if (typeof obj.message !== "string" || !obj.message.trim()) return null;

  return {
    message: obj.message,
    actions: Array.isArray(obj.actions)
      ? obj.actions.filter((a): a is string => typeof a === "string").slice(0, 4)
      : [],
    citations: Array.isArray(obj.citations)
      ? (obj.citations as NestResponse["citations"])
      : undefined,
  };
}

function emitAssistantText(
  controller: { enqueue: (chunk: UIMessageChunk) => void },
  text: string,
  textEmitted: TextEmittedFlag,
) {
  if (textEmitted.value || !text.trim()) return;
  controller.enqueue({ type: "text-start", id: ASSISTANT_TEXT_ID });
  controller.enqueue({
    type: "text-delta",
    id: ASSISTANT_TEXT_ID,
    delta: text,
  });
  controller.enqueue({ type: "text-end", id: ASSISTANT_TEXT_ID });
  textEmitted.value = true;
}

/**
 * LangChain structured output (toolStrategy) emits tool-output-available without
 * a matching tool-input-start. AI SDK v6 throws on that and aborts before later
 * text chunks — convert/suppress orphan tool outputs during the stream.
 */
function sanitizeAgentUIMessageStream(
  stream: ReadableStream<UIMessageChunk>,
  textEmitted: TextEmittedFlag,
): ReadableStream<UIMessageChunk> {
  const startedToolCalls = new Set<string>();

  return stream.pipeThrough(
    new TransformStream<UIMessageChunk, UIMessageChunk>({
      transform(chunk, controller) {
        if (
          chunk.type === "tool-input-start" ||
          chunk.type === "tool-input-available"
        ) {
          startedToolCalls.add(chunk.toolCallId);
          controller.enqueue(chunk);
          return;
        }

        if (
          chunk.type === "tool-output-available" ||
          chunk.type === "tool-output-error"
        ) {
          if (!startedToolCalls.has(chunk.toolCallId)) {
            if (chunk.type === "tool-output-available") {
              const structured = parseStructuredToolOutput(chunk.output);
              if (structured?.message) {
                emitAssistantText(controller, structured.message, textEmitted);
              }
            }
            return;
          }
        }

        controller.enqueue(chunk);
      },
    }),
  );
}

function writeAssistantText(
  writer: { write: (part: UIMessageChunk) => void },
  text: string,
  textEmitted: TextEmittedFlag,
) {
  if (textEmitted.value || !text.trim()) return;
  writer.write({ type: "text-start", id: ASSISTANT_TEXT_ID });
  writer.write({ type: "text-delta", id: ASSISTANT_TEXT_ID, delta: text });
  writer.write({ type: "text-end", id: ASSISTANT_TEXT_ID });
  textEmitted.value = true;
}

export async function streamNestAgentResponse(options: AgentStreamOptions) {
  const { identity, userMessage, resume } = options;
  const capturedUserMessage = userMessage ?? "";
  const memoryQuery = userMessage ?? resume?.kind ?? "";

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({
        type: "data-progress",
        data: { message: "Nest AI is thinking…" },
      });

      try {
        const [memoryContext, agent] = await Promise.all([
          prepareMemory(identity, memoryQuery),
          Promise.resolve(getNestAgent()),
        ]);

        const input = resume
          ? new Command({
              resume: {
                optionId: resume.optionId,
                kind: resume.kind,
                optionMeta: resume.optionMeta,
              },
            })
          : {
              messages: [new HumanMessage(userMessage ?? "")],
            };

        const graphStream = await agent.stream(input, {
          configurable: {
            thread_id: identity.threadId,
            memoryContainer: identity.memoryContainer,
          },
          context: { memoryContext: memoryContext || undefined },
          streamMode: ["values", "messages"],
        });

        const textEmitted: TextEmittedFlag = { value: false };

        writer.merge(
          sanitizeAgentUIMessageStream(
            toUIMessageStream<NestAgentGraphState>(graphStream, {
              onFinish: async (state) => {
                if (!state) return;

                const structured = state.structuredResponse as
                  | NestResponse
                  | undefined;
                const payload = buildClientPayload({
                  ...state,
                  structuredResponse: structured,
                });
                const message = resolveMessage(structured, state);
                const actions = resolveActions(
                  structured,
                  capturedUserMessage,
                  state,
                );

                writeAssistantText(writer, message, textEmitted);

                if (capturedUserMessage) {
                  void storeConversation(
                    identity.memoryContainer,
                    capturedUserMessage,
                    message,
                  );
                }

                writer.write({
                  type: "data-actions",
                  data: { actions },
                });

                if (payload.interaction) {
                  writer.write({
                    type: "data-interaction",
                    data: payload.interaction,
                  });
                }

                if (
                  payload.property &&
                  payload.interaction?.status !== "needs_selection"
                ) {
                  writer.write({
                    type: "data-property",
                    data: payload.property,
                  });
                }

                if (payload.citations?.length) {
                  writer.write({
                    type: "data-citations",
                    data: { citations: payload.citations },
                  });
                }
              },
            }),
            textEmitted,
          ),
        );
      } catch (err) {
        await writeStreamFallback(writer, identity, capturedUserMessage, err);
      }
    },
    onError: () => friendlyChatError(new Error("stream_error")),
  });

  return createUIMessageStreamResponse({ stream });
}

async function writeStreamFallback(
  writer: { write: (part: UIMessageChunk) => void },
  identity: ChatIdentity,
  userMessage: string,
  err: unknown,
) {
  const { runFallbackAgent } = await import("./fallback");
  const fallback = await runFallbackAgent(userMessage, []);
  void storeConversation(identity.memoryContainer, userMessage, fallback.message);

  writer.write({ type: "text-start", id: "fallback-text" });
  writer.write({ type: "text-delta", id: "fallback-text", delta: fallback.message });
  writer.write({ type: "text-end", id: "fallback-text" });
  writer.write({
    type: "data-actions",
    data: { actions: fallback.actions },
  });
  if (fallback.interaction) {
    writer.write({
      type: "data-interaction",
      data: fallback.interaction,
    });
  }
  if (fallback.propertyLookup && fallback.interaction?.status !== "needs_selection") {
    writer.write({
      type: "data-property",
      data: {
        intel: fallback.propertyLookup.intel,
        formattedAddress: fallback.propertyLookup.formattedAddress,
        termSheet: fallback.propertyLookup.termSheetAt25Down,
      },
    });
  }
  if (process.env.NODE_ENV === "development") {
    console.error("nest agent fallback", err);
  }
}

/** Standalone fallback response when the stream cannot be opened. */
export async function streamFallbackResponse(
  identity: ChatIdentity,
  userMessage: string,
  err: unknown,
) {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      await writeStreamFallback(writer, identity, userMessage, err);
    },
  });

  return createUIMessageStreamResponse({ stream });
}
