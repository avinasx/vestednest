import { ToolMessage } from "@langchain/core/messages";
import { createMiddleware } from "langchain";
import {
  isConversationalQuery,
  isLikelyAddressQuery,
} from "@/lib/chat-intent";
import {
  interactionToAddressSuggestions,
  propertyFromInteraction,
  toClientInteraction,
} from "@/lib/chat-interactions";
import type { ChatInteraction } from "@/lib/chat-interactions/types";
import { nestAgentStateSchema } from "./state";
import type { PropertyLookupResult } from "./tools";

const ADDRESS_TOOLS = new Set([
  "lookup_property",
  "get_rate_quote",
  "calculate_dscr",
]);

const KB_TOOLS = new Set(["search_knowledge_base", "recall_user_context"]);

const ELIGIBILITY_TOOLS = new Set(["check_state_eligibility"]);

function lastUserText(messages: unknown[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as { _getType?: () => string; content?: unknown };
    const type = m._getType?.() ?? (m as { role?: string }).role;
    if (type === "human" || type === "user") {
      const c = m.content;
      if (typeof c === "string") return c;
      if (Array.isArray(c)) {
        return c
          .map((p) =>
            typeof p === "string" ? p : (p as { text?: string }).text ?? "",
          )
          .join("");
      }
    }
  }
  return "";
}

function parseToolJson(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function syncStateFromToolResult(
  toolName: string,
  raw: string,
): Partial<{
  lastInteraction: ChatInteraction | null;
  propertyLookup: PropertyLookupResult | null;
  citations: { title: string; source: string }[];
}> {
  const parsed = parseToolJson(raw);
  if (!parsed) return {};

  const interaction = parsed.interaction as ChatInteraction | undefined;
  const updates: Partial<{
    lastInteraction: ChatInteraction | null;
    propertyLookup: PropertyLookupResult | null;
    citations: { title: string; source: string }[];
  }> = {};

  if (interaction) {
    updates.lastInteraction = interaction;
    const property = propertyFromInteraction(interaction);
    if (property) {
      updates.propertyLookup = {
        intel: property.intel,
        formattedAddress: property.formattedAddress,
        termSheetAt25Down: property.termSheet,
      };
    }
  }

  if (toolName === "search_knowledge_base") {
    const citations = parsed.citations as
      | { title: string; source: string }[]
      | undefined;
    if (citations?.length) {
      updates.citations = citations;
    } else if (parsed.found && parsed.content) {
      const content = String(parsed.content);
      const titles = [...content.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
      if (titles.length) {
        updates.citations = titles.slice(0, 3).map((title) => ({
          title,
          source: "knowledge_base",
        }));
      }
    }
  }

  return updates;
}

function collectStateFromMessages(messages: unknown[]) {
  let lastInteraction: ChatInteraction | null = null;
  let propertyLookup: PropertyLookupResult | null = null;
  const citations: { title: string; source: string }[] = [];

  for (const m of messages) {
    if (!(m instanceof ToolMessage)) continue;
    const content =
      typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    const updates = syncStateFromToolResult(m.name ?? "", content);
    if (updates.lastInteraction !== undefined) {
      lastInteraction = updates.lastInteraction;
    }
    if (updates.propertyLookup !== undefined) {
      propertyLookup = updates.propertyLookup;
    }
    if (updates.citations?.length) {
      citations.push(...updates.citations);
    }
  }

  return { lastInteraction, propertyLookup, citations };
}

/** Filter tools per-turn intent; sync interaction state from tool results. */
export const nestAgentMiddleware = createMiddleware({
  name: "NestAgentMiddleware",
  stateSchema: nestAgentStateSchema,

  wrapModelCall: async (request, handler) => {
    const userText = lastUserText(request.messages ?? []);
    let tools = request.tools ?? [];

    if (userText) {
      const toolName = (t: (typeof tools)[number]) =>
        "name" in t && typeof t.name === "string" ? t.name : "";
      if (isConversationalQuery(userText) && !isLikelyAddressQuery(userText)) {
        tools = tools.filter((t) => !ADDRESS_TOOLS.has(toolName(t)));
      } else if (isLikelyAddressQuery(userText)) {
        tools = tools.filter(
          (t) =>
            ADDRESS_TOOLS.has(toolName(t)) ||
            ELIGIBILITY_TOOLS.has(toolName(t)) ||
            toolName(t) === "save_user_preference",
        );
      } else if (
        /\b(eligible|fund|state|nd|sd|nj|ny|va)\b/i.test(userText)
      ) {
        tools = tools.filter(
          (t) =>
            ELIGIBILITY_TOOLS.has(toolName(t)) ||
            KB_TOOLS.has(toolName(t)) ||
            toolName(t) === "save_user_preference" ||
            toolName(t) === "recall_user_context",
        );
      }
    }

    return handler({ ...request, tools });
  },

  wrapToolCall: async (request, handler) => {
    const toolName = request.toolCall.name;
    if (toolName === "lookup_property") {
      request.runtime.writer?.({
        type: "progress",
        message: "Pulling rent comps and property data…",
      });
    } else if (toolName === "search_knowledge_base") {
      request.runtime.writer?.({
        type: "progress",
        message: "Searching lending knowledge…",
      });
    }

    return handler(request);
  },

  afterAgent: async (state) => {
    const messages = (state as { messages?: unknown[] }).messages ?? [];
    const collected = collectStateFromMessages(messages);
    if (
      !collected.lastInteraction &&
      !collected.propertyLookup &&
      !collected.citations.length
    ) {
      return undefined;
    }
    return collected;
  },
});

export function buildClientPayload(state: {
  lastInteraction?: ChatInteraction | null;
  propertyLookup?: PropertyLookupResult | null;
  structuredResponse?: {
    message: string;
    actions: string[];
    citations?: { title: string; source: string }[];
  };
}) {
  const interaction = state.lastInteraction ?? null;
  const clientInteraction = toClientInteraction(interaction);
  return {
    interaction: clientInteraction,
    addressSuggestions: interactionToAddressSuggestions(interaction),
    property: state.propertyLookup
      ? {
          intel: state.propertyLookup.intel,
          formattedAddress: state.propertyLookup.formattedAddress,
          termSheet: state.propertyLookup.termSheetAt25Down,
        }
      : null,
    citations: state.structuredResponse?.citations ?? [],
  };
}
