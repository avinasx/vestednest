import { mightBeAddressQuery } from "@/lib/address-resolve";
import {
  ADDRESS_KIND,
  ELIGIBILITY_KIND,
  interactionToAddressSuggestions,
  resolveInteraction,
  toClientInteraction,
} from "@/lib/chat-interactions";
import { propertyFromInteraction } from "@/lib/chat-interactions/compat";
import type { AgentResponse } from "./nest-agent";
import { clearLastPropertyLookup } from "./tools";

function buildAgentResponse(
  interaction: Awaited<ReturnType<typeof resolveInteraction>>,
  extraActions: string[] = [],
): AgentResponse {
  const propertyLookup = propertyFromInteraction(interaction);
  const clientInteraction = toClientInteraction(interaction);

  let actions: string[] = [];
  if (clientInteraction?.status === "needs_selection") {
    actions = [];
  } else if (propertyLookup) {
    actions = ["Yes — open term sheet", "Adjust loan structure", "Download PDF now"];
  } else {
    actions = extraActions;
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

/** Rule-based fallback when Gemini is unavailable (quota, etc.). */
export async function runFallbackAgent(
  userMessage: string,
): Promise<AgentResponse> {
  const ml = userMessage.toLowerCase();
  clearLastPropertyLookup();

  if (/\b(north dakota|south dakota)\b/i.test(ml) || /\b(nd|sd)\b/i.test(ml)) {
    const state =
      ml.includes("south dakota") || /\bsd\b/i.test(ml) ? "SD" : "ND";
    const interaction = await resolveInteraction(ELIGIBILITY_KIND, { state });
    return buildAgentResponse(interaction, ["Check another state", "Get a DSCR quote"]);
  }

  if (mightBeAddressQuery(userMessage)) {
    const interaction = await resolveInteraction(ADDRESS_KIND, {
      address: userMessage,
      state: "GA",
    });
    return buildAgentResponse(interaction, [
      "Try a full address",
      "Get a DSCR quote",
    ]);
  }

  if (ml.includes("bridge") || ml.includes("refi")) {
    return {
      message:
        "Bridge exits are where we shine. We can reuse your bridge appraisal (saves ~$650), close in 14 days, and there's no prepay penalty after 6 months on the new DSCR. What's the property address?",
      actions: ["142 Oak Ridge Dr Atlanta GA 30315", "Show me current rates"],
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("dscr")) {
    return {
      message:
        "I'll calculate DSCR from the address. We pull rent comps from market data and run the ratio in real time. Anything above 1.0x qualifies — we prefer 1.25x+.",
      actions: ["142 Oak Ridge Dr Atlanta GA 30315", "What if DSCR is below 1.0?"],
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("foreign")) {
    return {
      message:
        "Yes — foreign national LLC borrowers are fully eligible. You'll need a US-registered LLC, ITIN or passport, and 3 months of bank statements.",
      actions: ["What docs do I need?", "Foreign national rates"],
      interaction: null,
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  return {
    message:
      "Got it. I can get you a DSCR quote, help you refi out of a bridge loan, or run cash-out numbers — all without a hard pull. What's the property address?",
    actions: ["Get a DSCR quote", "Refi out of bridge", "Check my DSCR"],
    interaction: null,
    propertyLookup: null,
    addressSuggestions: null,
  };
}
