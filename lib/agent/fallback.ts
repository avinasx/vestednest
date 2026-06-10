import {
  type ChatHistoryItem,
  isLikelyAddressQuery,
  suggestFollowUpActions,
} from "@/lib/chat-intent";
import {
  ADDRESS_KIND,
  ELIGIBILITY_KIND,
  interactionToAddressSuggestions,
  resolveInteraction,
  selectionActionsFromInteraction,
  toClientInteraction,
} from "@/lib/chat-interactions";
import { propertyFromInteraction } from "@/lib/chat-interactions/compat";
import type { AgentResponse } from "./nest-agent";

function buildAgentResponse(
  interaction: Awaited<ReturnType<typeof resolveInteraction>>,
  history: ChatHistoryItem[],
  userMessage: string,
): AgentResponse {
  const propertyLookup = propertyFromInteraction(interaction);
  const clientInteraction = toClientInteraction(interaction);

  let actions: string[] = [];
  if (clientInteraction?.status === "needs_selection") {
    actions = selectionActionsFromInteraction(clientInteraction);
  } else if (propertyLookup) {
    actions = suggestFollowUpActions(userMessage, history, { hasProperty: true });
  } else {
    actions = suggestFollowUpActions(userMessage, history);
  }

  if (propertyLookup && clientInteraction?.status === "success") {
    const ts = propertyLookup.termSheet;
    return {
      message: `On it — pulled property data.\n\n✓ Property: ${propertyLookup.formattedAddress}\n✓ Estimated rent: $${propertyLookup.intel.estimatedRent.toLocaleString()}/mo\n✓ DSCR at 25% down: ${ts.dscr}x\n✓ Rate: ${ts.rate.toFixed(2)}% · 30yr Fixed\n\nReady to see the full interactive term sheet?`,
      actions,
      interaction: clientInteraction,
      propertyLookup: {
        intel: propertyLookup.intel,
        formattedAddress: propertyLookup.formattedAddress,
        termSheetAt25Down: propertyLookup.termSheet,
      },
      addressSuggestions: null,
    };
  }

  return {
    message: interaction.message,
    actions,
    interaction: clientInteraction,
    propertyLookup: propertyLookup
      ? {
          intel: propertyLookup.intel,
          formattedAddress: propertyLookup.formattedAddress,
          termSheetAt25Down: propertyLookup.termSheet,
        }
      : null,
    addressSuggestions: interactionToAddressSuggestions(interaction),
  };
}

function lastUserAddress(history: ChatHistoryItem[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.role === "user" && isLikelyAddressQuery(m.content)) {
      return m.content.trim();
    }
  }
  return null;
}

/** Rule-based fallback when Gemini is unavailable (quota, etc.). */
export async function runFallbackAgent(
  userMessage: string,
  history: ChatHistoryItem[] = [],
): Promise<AgentResponse> {
  const ml = userMessage.toLowerCase().trim();

  if (ml === "use my last address") {
    const prior = lastUserAddress(history);
    if (prior) {
      const interaction = await resolveInteraction(ADDRESS_KIND, {
        address: prior,
        state: "GA",
      });
      return buildAgentResponse(interaction, history, userMessage);
    }
    return {
      message:
        "I don't have a prior address in this chat yet. Drop the full street address with city and state, and I'll run the numbers.",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (/\b(north dakota|south dakota)\b/i.test(ml) || /\b(nd|sd)\b/i.test(ml)) {
    const state =
      ml.includes("south dakota") || /\bsd\b/i.test(ml) ? "SD" : "ND";
    const interaction = await resolveInteraction(ELIGIBILITY_KIND, { state });
    return buildAgentResponse(interaction, history, userMessage);
  }

  if (isLikelyAddressQuery(userMessage)) {
    const interaction = await resolveInteraction(ADDRESS_KIND, {
      address: userMessage,
      state: "GA",
    });
    return buildAgentResponse(interaction, history, userMessage);
  }

  if (
    ml.includes("below 1") ||
    ml.includes("under 1") ||
    ml.includes("less than 1") ||
    ml.includes("low dscr")
  ) {
    return {
      message:
        "If DSCR comes in below 1.0x, you still have options. Our near-DSCR program can work from about 0.75x with a lower max LTV — usually stepping down roughly 5% from standard caps. Putting more down or choosing interest-only can also improve the ratio. Share a property address and I'll show you the live number with a few structure options.",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("near-dscr") || ml.includes("near dscr")) {
    return {
      message:
        "Near-DSCR covers ratios from about 0.75x up to 0.99x. You qualify with reduced LTV versus a standard 1.0x+ file — we price it on the same rate sheet with the LTV haircut baked in. Drop an address and I'll show whether you're standard or near-DSCR at 25% down.",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (
    ml.includes("adjust") &&
    (ml.includes("loan") || ml.includes("structure") || ml.includes("ltv") || ml.includes("down"))
  ) {
    const hasProperty = history.some(
      (m) =>
        m.role === "assistant" &&
        /\bEstimated rent:/i.test(m.content),
    );
    return {
      message: hasProperty
        ? "Happy to tune the structure. On the term sheet you can move down payment (20–40%), flip interest-only, and change term — DSCR and rate update live. Tell me what you want to try (e.g. 30% down, interest-only) or open the term sheet to drag the sliders."
        : "I can adjust down payment, interest-only, and term once we have a property on file. Drop the address first and I'll pull comps — then we can tune the structure on the live term sheet.",
      actions: suggestFollowUpActions(userMessage, history, { hasProperty }),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("check my dscr") || ml === "check my dscr") {
    return {
      message:
        "I'll calculate DSCR from the property address — we pull rent comps, estimate PITIA, and run the ratio in real time. Standard qualification is 1.0x; we prefer 1.25x+ for max LTV. What's the address?",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("how") && ml.includes("dscr")) {
    return {
      message:
        "DSCR is monthly rent divided by monthly PITIA (principal, interest, taxes, insurance, and HOA if any). We use market rent comps for the numerator and our live rate sheet for the debt side — no W2 or tax returns. Above 1.0x qualifies; 1.25x+ gets you the best LTV.",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("dscr")) {
    return {
      message:
        "DSCR is the big unlock for investors — we qualify on the property's rent vs. the payment, not your personal income. Share an address and I'll pull comps and quote rate + DSCR in seconds. Standard threshold is 1.0x; we like 1.25x+ for max leverage.",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("bridge") || ml.includes("refi")) {
    return {
      message:
        "Bridge exits are where we shine. We can reuse your bridge appraisal (saves ~$650), close in about 14 days, and there's no prepay penalty after 6 months on the new DSCR. What's the property address?",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("foreign")) {
    return {
      message:
        "Yes — foreign national LLC borrowers are fully eligible. You'll need a US-registered LLC, ITIN or passport, and 3 months of bank statements.",
      actions: suggestFollowUpActions(userMessage, history),
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  return {
    message:
      "Got it. I can get you a DSCR quote, help you refi out of a bridge loan, or run cash-out numbers — all without a hard pull. What's the property address, or what would you like to know?",
    actions: suggestFollowUpActions(userMessage, history),
    interaction: null,
    propertyLookup: null,
    addressSuggestions: null,
  };
}
