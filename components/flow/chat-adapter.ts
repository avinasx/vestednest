import {
  parseJsonEventStream,
  uiMessageChunkSchema,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import {
  interactionToAddressSuggestions,
  selectionActionsFromInteraction,
} from "@/lib/chat-interactions";
import type { ChatInteraction } from "@/lib/chat-interactions/types";
import type { ChatMessage } from "./types";

/** Parse SSE body from /api/chat/resume into UIMessage chunks. */
export function parseUIMessageChunkStream(
  body: ReadableStream<Uint8Array>,
): ReadableStream<UIMessageChunk> {
  const parsed = parseJsonEventStream({
    stream: body,
    schema: uiMessageChunkSchema,
  });

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const reader = parsed.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value.success) controller.enqueue(value.value);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export function uiMessageToChatMessage(msg: UIMessage): ChatMessage {
  const text = msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  const actionsPart = msg.parts.find((p) => p.type === "data-actions") as
    | { type: "data-actions"; data?: { actions?: string[] } }
    | undefined;
  const interactionPart = msg.parts.find((p) => p.type === "data-interaction") as
    | { type: "data-interaction"; data?: Omit<ChatInteraction, "source"> }
    | undefined;

  const interaction = interactionPart?.data ?? undefined;

  const selectionActions = selectionActionsFromInteraction(interaction);
  const actionsFromStream = actionsPart?.data?.actions;
  const actions =
    selectionActions.length > 0
      ? selectionActions
      : actionsFromStream?.length
        ? actionsFromStream
        : undefined;

  return {
    role: msg.role === "user" ? "user" : "assistant",
    content: text,
    actions,
    interaction,
    addressSuggestions: interactionToAddressSuggestions(
      interaction as ChatInteraction | undefined,
    ) ?? undefined,
  };
}
