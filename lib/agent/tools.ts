import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { parseUsAddress } from "@/lib/address";
import { calculateTermSheet, calculateTermSheetAsync } from "@/lib/dscr";
import { isStateEligible } from "@/lib/eligibility";
import { searchKnowledgeBase } from "@/lib/knowledge-base";
import { buildPropertyIntel, enrichPropertyIntel, formatAddress } from "@/lib/property-intel";
import {
  lookupProperty,
  searchAddressSuggestions,
  searchNearbyProperties,
} from "@/lib/realie";

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
      const nearby = await searchNearbyProperties(result.property, 4);
      return { property: result.property, nearby };
    }
  }

  const fallbackState = state ?? parsed?.state ?? "GA";
  const search = await searchAddressSuggestions(address, fallbackState, 5);
  const first = search.suggestions[0];
  if (first) {
    return {
      property: first.property,
      nearby: await searchNearbyProperties(first.property, 4),
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

    const intel = await enrichPropertyIntel(
      buildPropertyIntel(resolved.property, resolved.nearby),
    );
    const formattedAddress = formatAddress(intel);
    const stateCheck = intel.state
      ? await isStateEligible(intel.state)
      : null;

    if (stateCheck && !stateCheck.eligible) {
      return JSON.stringify({
        found: true,
        address: formattedAddress,
        state: intel.state,
        eligible: false,
        message: stateCheck.message,
        propertyType: intel.propertyType,
        marketValue: intel.marketValue,
        estimatedRent: intel.estimatedRent,
      });
    }

    const termSheet = await calculateTermSheetAsync({
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

    lastLookup = { intel, formattedAddress, termSheetAt25Down: termSheet };

    return JSON.stringify({
      found: true,
      address: formattedAddress,
      eligible: true,
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
      state: intel.state,
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
  async ({ purchasePrice, downPaymentPct, monthlyRent, annualTax, interestOnly, state }) => {
    const termSheet = await calculateTermSheetAsync({
      purchasePrice,
      downPaymentPct,
      monthlyRent,
      annualTax,
      purpose: "purchase",
      term: "30yr",
      prepay: "3yr",
      interestOnly: interestOnly ?? false,
      state,
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
      state: z.string().optional().describe("Two-letter US state code"),
    }),
  },
);

export const searchKnowledgeBaseTool = tool(
  async ({ query }) => {
    const results = await searchKnowledgeBase(query, 5);
    if (!results) {
      return JSON.stringify({
        found: false,
        message: "No knowledge base results. Use product facts from system prompt.",
      });
    }
    return JSON.stringify({ found: true, content: results });
  },
  {
    name: "search_knowledge_base",
    description:
      "Search Vested Nest lending knowledge base for policies, product details, state eligibility, rate guidelines, and FAQ answers.",
    schema: z.object({
      query: z.string().describe("Search query for lending knowledge"),
    }),
  },
);

export const checkStateEligibilityTool = tool(
  async ({ state, borrowerType }) => {
    const result = await isStateEligible(state, borrowerType);
    return JSON.stringify({
      state: result.state,
      eligible: result.eligible,
      status: result.status,
      requiresAttestation: result.requiresAttestation,
      requiresLlc: result.requiresLlc,
      fundedStateCount: result.fundedStates.length,
      message: result.message,
    });
  },
  {
    name: "check_state_eligibility",
    description:
      "Check if a US state is eligible for Vested Nest DSCR lending. Hard-blocks ND and SD. NJ/NY may require broker attestation. VA requires LLC entity vesting.",
    schema: z.object({
      state: z.string().describe("Two-letter US state code, e.g. GA, FL, TX"),
      borrowerType: z
        .enum(["llc", "individual", "foreign"])
        .optional()
        .describe("Borrower entity type for state-specific rules (e.g. VA LLC-only)"),
    }),
  },
);

export const nestTools = [
  lookupPropertyTool,
  calculateDscrTool,
  searchKnowledgeBaseTool,
  checkStateEligibilityTool,
];
