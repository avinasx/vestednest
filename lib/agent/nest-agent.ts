import { HumanMessage } from "@langchain/core/messages";
import {
  suggestFollowUpActions,
  type ChatHistoryItem,
} from "@/lib/chat-intent";
import {
  interactionToAddressSuggestions,
  selectionActionsFromInteraction,
  filterUserFacingActions,
  toClientInteraction,
} from "@/lib/chat-interactions";
import { getMemoryContext, storeConversation } from "@/lib/supermemory";
import { resolveChatIdentity, getOptionalUser } from "@/lib/auth/optional-user";
import { buildClientPayload } from "./middleware";
import { getNestAgent } from "./graph";
import type { NestResponse } from "./response-schema";
import type { PropertyLookupResult } from "./tools";

export type AgentResponse = {
  message: string;
  actions: string[];
  interaction: ReturnType<typeof toClientInteraction>;
  propertyLookup: PropertyLookupResult | null;
  /** @deprecated Mapped from interaction — use interaction instead */
  addressSuggestions: ReturnType<typeof interactionToAddressSuggestions>;
};

function messageFromInteraction(
  interaction: ReturnType<typeof buildClientPayload>["interaction"],
): string | null {
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

/** Non-streaming invoke — prefer streamNestAgentResponse for /api/chat. */
export async function runNestAgent(
  sessionId: string,
  userMessage: string,
  _history: { role: "user" | "assistant"; content: string }[] = [],
): Promise<AgentResponse> {
  try {
    const user = await getOptionalUser();
    const identity = resolveChatIdentity(sessionId, user?.id);
    const memoryContext = await getMemoryContext(
      identity.memoryContainer,
      userMessage,
    );
    const agent = getNestAgent();

    const result = await agent.invoke(
      { messages: [new HumanMessage(userMessage)] },
      {
        configurable: {
          thread_id: identity.threadId,
          memoryContainer: identity.memoryContainer,
        },
        context: { memoryContext: memoryContext || undefined },
      },
    );

    const structured = result.structuredResponse as NestResponse | undefined;
    const payload = buildClientPayload({
      ...result,
      structuredResponse: structured,
    });
    const interactionMessage = messageFromInteraction(payload.interaction);
    const message = interactionMessage ?? structured?.message ?? userMessage;

    const historyItems: ChatHistoryItem[] = [];
    const actions =
      payload.interaction?.status === "needs_selection"
        ? selectionActionsFromInteraction(payload.interaction)
        : structured?.actions?.length
          ? filterUserFacingActions(structured.actions).slice(0, 4)
          : suggestFollowUpActions(userMessage, historyItems, {
              hasProperty: Boolean(result.propertyLookup),
            });

    await storeConversation(identity.memoryContainer, userMessage, message);

    return {
      message,
      actions,
      interaction: payload.interaction,
      propertyLookup: result.propertyLookup ?? null,
      addressSuggestions: payload.addressSuggestions,
    };
  } catch (err) {
    const { runFallbackAgent } = await import("./fallback");
    const fallback = await runFallbackAgent(userMessage, []);
    await storeConversation(
      resolveChatIdentity(sessionId).memoryContainer,
      userMessage,
      fallback.message,
    );
    return fallback;
  }
}
