import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  ADDRESS_KIND,
  ELIGIBILITY_KIND,
  resolveInteraction,
  resolveInteractionSelection,
  type ChatInteraction,
} from "@/lib/chat-interactions";
import {
  interactionToAddressSuggestions,
  propertyFromInteraction,
} from "@/lib/chat-interactions/compat";
import type { AddressInteractionData } from "@/lib/chat-interactions/types";
import { calculateTermSheet, calculateTermSheetAsync } from "@/lib/dscr";
import { searchKnowledgeBase } from "@/lib/knowledge-base";

export type PropertyLookupResult = {
  intel: AddressInteractionData["intel"];
  formattedAddress: string;
  termSheetAt25Down: AddressInteractionData["termSheet"];
};

let lastInteraction: ChatInteraction | null = null;

export function getLastInteraction(): ChatInteraction | null {
  return lastInteraction;
}

export function getLastPropertyLookup(): PropertyLookupResult | null {
  const property = propertyFromInteraction(lastInteraction);
  if (!property) return null;
  return {
    intel: property.intel,
    formattedAddress: property.formattedAddress,
    termSheetAt25Down: property.termSheet,
  };
}

/** @deprecated Use getLastInteraction — kept for transitional imports */
export function getLastAddressSuggestions() {
  return interactionToAddressSuggestions(lastInteraction);
}

export function clearLastPropertyLookup() {
  lastInteraction = null;
}

function syncFromInteraction(interaction: ChatInteraction) {
  lastInteraction = interaction;
}

export const lookupPropertyTool = tool(
  async ({ address, state }) => {
    const interaction = await resolveInteraction(ADDRESS_KIND, {
      address,
      state: state ?? "GA",
    });
    syncFromInteraction(interaction);

    if (interaction.status === "needs_selection") {
      return JSON.stringify({
        found: false,
        needsSelection: true,
        message: interaction.message,
        interaction,
      });
    }

    if (
      interaction.status === "not_found" ||
      interaction.status === "invalid_input" ||
      interaction.status === "error"
    ) {
      return JSON.stringify({
        found: false,
        error: interaction.message,
        interaction,
      });
    }

    if (interaction.status === "blocked") {
      const data = interaction.data as Partial<AddressInteractionData> & {
        intel?: AddressInteractionData["intel"];
        formattedAddress?: string;
      };
      return JSON.stringify({
        found: true,
        eligible: false,
        address: data.formattedAddress,
        state: data.intel?.state,
        message: interaction.message,
        interaction,
      });
    }

    const property = propertyFromInteraction(interaction);
    if (!property) {
      return JSON.stringify({
        found: false,
        error: interaction.message,
        interaction,
      });
    }

    const { intel, formattedAddress, termSheet } = property;

    return JSON.stringify({
      found: true,
      eligible: true,
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
      state: intel.state,
      interaction,
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
    const interaction = await resolveInteraction(ELIGIBILITY_KIND, {
      state,
      borrowerType,
    });
    syncFromInteraction(interaction);

    const data = interaction.data as {
      state?: string;
      eligible?: boolean;
      requiresAttestation?: boolean;
      requiresLlc?: boolean;
    } | undefined;

    return JSON.stringify({
      state: data?.state ?? state,
      eligible: data?.eligible ?? interaction.status === "success",
      status: interaction.status,
      message: interaction.message,
      requiresAttestation: data?.requiresAttestation,
      requiresLlc: data?.requiresLlc,
      interaction,
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

/** Resolve a prior needs_selection interaction (e.g. address pick). */
export async function resolveToolSelection(
  kind: string,
  optionId: string,
  meta?: Record<string, unknown>,
): Promise<ChatInteraction> {
  const interaction = await resolveInteractionSelection(kind, optionId, meta);
  syncFromInteraction(interaction);
  return interaction;
}

export const nestTools = [
  lookupPropertyTool,
  calculateDscrTool,
  searchKnowledgeBaseTool,
  checkStateEligibilityTool,
];
