import {
  mightBeAddressQuery,
  resolveAddressInput,
} from "@/lib/address-resolve";
import { calculateTermSheet } from "@/lib/dscr";
import { buildPropertyIntel, enrichPropertyIntel, formatAddress } from "@/lib/property-intel";
import type { AgentResponse } from "./nest-agent";
import { clearLastPropertyLookup } from "./tools";

async function buildPropertyLookup(
  property: Record<string, unknown>,
  nearby: Record<string, unknown>[],
) {
  const intel = await enrichPropertyIntel(buildPropertyIntel(property, nearby));
  const formattedAddress = formatAddress(intel);
  const termSheet = calculateTermSheet({
    purchasePrice: intel.arv || intel.marketValue || 300000,
    downPaymentPct: 25,
    monthlyRent: intel.estimatedRent,
    annualTax: intel.annualTax ?? 3000,
    purpose: "purchase",
    term: "30yr",
    prepay: "3yr",
    interestOnly: false,
    state: intel.state,
  });
  return { intel, formattedAddress, termSheetAt25Down: termSheet };
}

/** Rule-based fallback when Gemini is unavailable (quota, etc.). */
export async function runFallbackAgent(
  userMessage: string,
): Promise<AgentResponse> {
  const ml = userMessage.toLowerCase();
  clearLastPropertyLookup();

  if (mightBeAddressQuery(userMessage)) {
    const resolved = await resolveAddressInput(userMessage, "GA");

    if (resolved.status === "suggestions") {
      return {
        message: resolved.message,
        actions: [],
        propertyLookup: null,
        addressSuggestions: resolved.suggestions,
      };
    }

    if (resolved.status === "not_found" || resolved.status === "error") {
      return {
        message: resolved.message,
        actions: ["Try a full address", "Get a DSCR quote"],
        propertyLookup: null,
        addressSuggestions: null,
      };
    }

    if (resolved.status === "found") {
      const lookup = await buildPropertyLookup(resolved.property, resolved.nearby);
      const ts = lookup.termSheetAt25Down;
      return {
        message: `On it — pulled property data via Realie.\n\n✓ Property: ${lookup.formattedAddress}\n✓ Estimated rent: $${lookup.intel.estimatedRent.toLocaleString()}/mo\n✓ DSCR at 25% down: ${ts.dscr}x\n✓ Rate: ${ts.rate.toFixed(2)}% · 30yr Fixed\n\nReady to see the full interactive term sheet?`,
        actions: ["Yes — open term sheet", "Adjust loan structure", "Download PDF now"],
        propertyLookup: lookup,
        addressSuggestions: null,
      };
    }
  }

  if (ml.includes("bridge") || ml.includes("refi")) {
    return {
      message:
        "Bridge exits are where we shine. We can reuse your bridge appraisal (saves ~$650), close in 14 days, and there's no prepay penalty after 6 months on the new DSCR. What's the property address?",
      actions: ["142 Oak Ridge Dr Atlanta GA 30315", "Show me current rates"],
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("dscr")) {
    return {
      message:
        "I'll calculate DSCR from the address. We pull rent comps via Realie market data and run the ratio in real time. Anything above 1.0x qualifies — we prefer 1.25x+.",
      actions: ["142 Oak Ridge Dr Atlanta GA 30315", "What if DSCR is below 1.0?"],
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  if (ml.includes("foreign")) {
    return {
      message:
        "Yes — foreign national LLC borrowers are fully eligible. You'll need a US-registered LLC, ITIN or passport, and 3 months of bank statements.",
      actions: ["What docs do I need?", "Foreign national rates"],
      propertyLookup: null,
      addressSuggestions: null,
    };
  }

  return {
    message:
      "Got it. I can get you a DSCR quote, help you refi out of a bridge loan, or run cash-out numbers — all without a hard pull. What's the property address?",
    actions: ["Get a DSCR quote", "Refi out of bridge", "Check my DSCR"],
    propertyLookup: null,
    addressSuggestions: null,
  };
}
