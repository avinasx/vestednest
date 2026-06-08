import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { parseUsAddress } from "@/lib/address";
import { calculateTermSheet } from "@/lib/dscr";
import { buildPropertyIntel, formatAddress } from "@/lib/property-intel";
import { lookupProperty, searchAddressSuggestions } from "@/lib/realie";

export type PropertyLookupResult = {
  intel: ReturnType<typeof buildPropertyIntel>;
  formattedAddress: string;
  termSheetAt25Down: ReturnType<typeof calculateTermSheet>;
};

let lastLookup: PropertyLookupResult | null = null;

export function getLastPropertyLookup(): PropertyLookupResult | null {
  return lastLookup;
}

export function clearLastPropertyLookup() {
  lastLookup = null;
}

async function resolveProperty(address: string, state?: string) {
  const parsed = parseUsAddress(address);
  if (parsed) {
    const result = await lookupProperty(parsed);
    if (result.property) {
      const search = await searchAddressSuggestions(
        parsed.streetAddress,
        parsed.state,
        4,
      );
      const nearby = search.suggestions
        .map((s) => s.property)
        .filter((p) => p !== result.property);
      return { property: result.property, nearby };
    }
  }

  const fallbackState = state ?? parsed?.state ?? "GA";
  const search = await searchAddressSuggestions(address, fallbackState, 5);
  const first = search.suggestions[0];
  if (first) {
    return {
      property: first.property,
      nearby: search.suggestions.slice(1).map((s) => s.property),
    };
  }

  return null;
}

export const lookupPropertyTool = tool(
  async ({ address, state }) => {
    const resolved = await resolveProperty(address, state);
    if (!resolved) {
      return JSON.stringify({
        found: false,
        error: "Property not found. Ask for a full US address with city and state.",
      });
    }

    const intel = buildPropertyIntel(resolved.property, resolved.nearby);
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

    lastLookup = { intel, formattedAddress, termSheetAt25Down: termSheet };

    return JSON.stringify({
      found: true,
      address: formattedAddress,
      propertyType: intel.propertyType,
      beds: intel.beds,
      baths: intel.baths,
      sqft: intel.sqft,
      marketValue: intel.marketValue,
      estimatedRent: intel.estimatedRent,
      arv: intel.arv,
      dscrAt25Down: termSheet.dscr,
      rateAt25Down: termSheet.rate,
      monthlyPitia: termSheet.monthlyPitia,
    });
  },
  {
    name: "lookup_property",
    description:
      "Look up a US rental property by address. Returns parcel data, estimated rent, market value, and preliminary DSCR at 25% down.",
    schema: z.object({
      address: z.string().describe("Full property address including city and state"),
      state: z
        .string()
        .optional()
        .describe("Two-letter state code if not in the address string"),
    }),
  },
);

export const calculateDscrTool = tool(
  async ({ purchasePrice, downPaymentPct, monthlyRent, annualTax, interestOnly }) => {
    const termSheet = calculateTermSheet({
      purchasePrice,
      downPaymentPct,
      monthlyRent,
      annualTax,
      purpose: "purchase",
      term: "30yr",
      prepay: "3yr",
      interestOnly: interestOnly ?? false,
    });

    return JSON.stringify({
      rate: termSheet.rate,
      loanAmount: termSheet.loanAmount,
      ltv: termSheet.ltv,
      monthlyPitia: termSheet.monthlyPitia,
      dscr: termSheet.dscr,
      qualifies: termSheet.qualifies,
      cashToClose: termSheet.cashToClose,
    });
  },
  {
    name: "calculate_dscr",
    description: "Calculate DSCR, rate, PITIA, and cash-to-close for a DSCR loan scenario.",
    schema: z.object({
      purchasePrice: z.number(),
      downPaymentPct: z.number().min(20).max(40),
      monthlyRent: z.number(),
      annualTax: z.number(),
      interestOnly: z.boolean().optional(),
    }),
  },
);

export const nestTools = [lookupPropertyTool, calculateDscrTool];
