import { parseUsAddress } from "@/lib/address";
import { calculateTermSheet } from "@/lib/dscr";
import { buildPropertyIntel, enrichPropertyIntel, formatAddress } from "@/lib/property-intel";
import {
  lookupProperty,
  searchAddressSuggestions,
  searchNearbyProperties,
} from "@/lib/realie";
import type { AgentResponse } from "./nest-agent";
import { clearLastPropertyLookup, getLastPropertyLookup } from "./tools";

function looksLikeAddress(message: string): boolean {
  const ml = message.toLowerCase();
  return (
    (/\d{1,5}\s+\w/.test(message) &&
      /(ave|dr|rd|st|blvd|ln|ct|way|pl|circle)/i.test(message)) ||
    /\d{5}/.test(message) ||
    /oak ridge|peachtree|cascade|maple|sylvan/i.test(ml)
  );
}

async function tryPropertyLookup(address: string) {
  clearLastPropertyLookup();
  const parsed = parseUsAddress(address);
  if (parsed) {
    const result = await lookupProperty(parsed);
    if (result.property) {
      const nearby = await searchNearbyProperties(result.property, 4);
      const intel = await enrichPropertyIntel(
        buildPropertyIntel(result.property, nearby),
      );
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
      });
      return { intel, formattedAddress, termSheetAt25Down: termSheet };
    }
  }

  const state = parsed?.state ?? "GA";
  const search = await searchAddressSuggestions(address, state, 3);
  const first = search.suggestions[0];
  if (!first) return null;

  const intel = await enrichPropertyIntel(
    buildPropertyIntel(
      first.property,
      await searchNearbyProperties(first.property, 4),
    ),
  );
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
  });
  return { intel, formattedAddress, termSheetAt25Down: termSheet };
}

/** Rule-based fallback when Gemini is unavailable (quota, etc.). */
export async function runFallbackAgent(
  userMessage: string,
): Promise<AgentResponse> {
  const ml = userMessage.toLowerCase();

  if (looksLikeAddress(userMessage)) {
    const lookup = await tryPropertyLookup(userMessage);
    if (lookup) {
      const ts = lookup.termSheetAt25Down;
      return {
        message: `On it — pulled property data via Realie.\n\n✓ Property: ${lookup.formattedAddress}\n✓ Estimated rent: $${lookup.intel.estimatedRent.toLocaleString()}/mo\n✓ DSCR at 25% down: ${ts.dscr}x\n✓ Rate: ${ts.rate.toFixed(2)}% · 30yr Fixed\n\nReady to see the full interactive term sheet?`,
        actions: ["Yes — open term sheet", "Adjust loan structure", "Download PDF now"],
        propertyLookup: lookup,
      };
    }
  }

  if (ml.includes("bridge") || ml.includes("refi")) {
    return {
      message:
        "Bridge exits are where we shine. We can reuse your bridge appraisal (saves ~$650), close in 14 days, and there's no prepay penalty after 6 months on the new DSCR. What's the property address?",
      actions: ["142 Oak Ridge Dr Atlanta GA 30315", "Show me current rates"],
      propertyLookup: getLastPropertyLookup(),
    };
  }

  if (ml.includes("dscr")) {
    return {
      message:
        "I'll calculate DSCR from the address. We pull rent comps via Realie market data and run the ratio in real time. Anything above 1.0x qualifies — we prefer 1.25x+.",
      actions: ["142 Oak Ridge Dr Atlanta GA 30315", "What if DSCR is below 1.0?"],
      propertyLookup: null,
    };
  }

  if (ml.includes("foreign")) {
    return {
      message:
        "Yes — foreign national LLC borrowers are fully eligible. You'll need a US-registered LLC, ITIN or passport, and 3 months of bank statements.",
      actions: ["What docs do I need?", "Foreign national rates"],
      propertyLookup: null,
    };
  }

  return {
    message:
      "Got it. I can get you a DSCR quote, help you refi out of a bridge loan, or run cash-out numbers — all without a hard pull. What's the property address?",
    actions: ["Get a DSCR quote", "Refi out of bridge", "Check my DSCR"],
    propertyLookup: null,
  };
}
