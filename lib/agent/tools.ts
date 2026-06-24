import { tool } from "@langchain/core/tools";
import type { RunnableConfig } from "@langchain/core/runnables";
import { interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { isLikelyAddressQuery } from "@/lib/chat-intent";
import {
  ADDRESS_KIND,
  RATE_QUOTE_KIND,
  resolveInteraction,
  resolveInteractionSelection,
  type ChatInteraction,
} from "@/lib/chat-interactions";
import { propertyFromInteraction } from "@/lib/chat-interactions/compat";
import type { AddressInteractionData } from "@/lib/chat-interactions/types";
import { evaluateFundingLane } from "@/lib/eligibility/matrix";
import { runScenarioEngine } from "@/lib/scenario-engine";
import { solve } from "@/lib/vn-engine";
import type { DealState } from "@/lib/deal/types";
import { searchAllKnowledgeSources } from "@/lib/knowledge-sources/registry";
import {
  recallUserContext,
  saveUserPreference,
} from "@/lib/supermemory";

export type PropertyLookupResult = {
  intel: AddressInteractionData["intel"];
  formattedAddress: string;
  termSheetAt25Down: AddressInteractionData["termSheet"];
};

type ToolConfig = RunnableConfig & {
  configurable?: {
    memoryContainer?: string;
    thread_id?: string;
  };
};

function memoryContainerFromConfig(config?: ToolConfig): string {
  return config?.configurable?.memoryContainer ?? "vestednest-anonymous";
}

function writeProgress(config: ToolConfig | undefined, message: string) {
  const writer = (config as { writer?: (chunk: unknown) => void })?.writer;
  writer?.({ type: "progress", message });
}

function interactionPayload(interaction: ChatInteraction) {
  return { interaction };
}

export const lookupPropertyTool = tool(
  async ({ address, state }, config: ToolConfig) => {
    writeProgress(config, "Pulling rent comps and property data…");

    if (!isLikelyAddressQuery(address)) {
      return JSON.stringify({
        found: false,
        skipped: true,
        message:
          "That doesn't look like a property address yet. Ask the user for a full US street address with city and state, or answer their question without a property lookup.",
      });
    }

    const interaction = await resolveInteraction(ADDRESS_KIND, {
      address,
      state: state ?? "GA",
    });

    if (interaction.status === "needs_selection") {
      const resume = interrupt({
        kind: ADDRESS_KIND,
        message: interaction.message,
        options: interaction.options,
      }) as { optionId: string; optionMeta?: Record<string, unknown> } | undefined;

      if (resume?.optionId) {
        const resolved = await resolveInteractionSelection(
          ADDRESS_KIND,
          resume.optionId,
          resume.optionMeta,
        );
        return formatAddressToolResult(resolved);
      }

      return JSON.stringify({
        found: false,
        needsSelection: true,
        message: interaction.message,
        ...interactionPayload(interaction),
      });
    }

    return formatAddressToolResult(interaction);
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

function formatAddressToolResult(interaction: ChatInteraction): string {
  if (
    interaction.status === "not_found" ||
    interaction.status === "invalid_input" ||
    interaction.status === "error"
  ) {
    return JSON.stringify({
      found: false,
      error: interaction.message,
      ...interactionPayload(interaction),
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
      ...interactionPayload(interaction),
    });
  }

  const property = propertyFromInteraction(interaction);
  if (!property) {
    return JSON.stringify({
      found: false,
      error: interaction.message,
      ...interactionPayload(interaction),
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
    ...interactionPayload(interaction),
  });
}

export const getRateQuoteTool = tool(
  async ({ state, fico, loanAmount }) => {
    const interaction = await resolveInteraction(RATE_QUOTE_KIND, {
      state,
      fico,
      loanAmount,
    });

    if (interaction.status === "needs_selection") {
      const resume = interrupt({
        kind: RATE_QUOTE_KIND,
        message: interaction.message,
        options: interaction.options,
      }) as { optionId: string; optionMeta?: Record<string, unknown> } | undefined;

      if (resume?.optionId) {
        const resolved = await resolveInteractionSelection(
          RATE_QUOTE_KIND,
          resume.optionId,
          resume.optionMeta,
        );
        return JSON.stringify({
          ok: true,
          message: resolved.message,
          ...interactionPayload(resolved),
        });
      }
    }

    return JSON.stringify({
      ok: interaction.status === "success",
      message: interaction.message,
      ...interactionPayload(interaction),
    });
  },
  {
    name: "get_rate_quote",
    description:
      "Get indicative DSCR rate guidance for a US state. Requires a property address for a live quote.",
    schema: z.object({
      state: z.string().optional().describe("Two-letter US state code"),
      fico: z.number().optional(),
      loanAmount: z.number().optional(),
    }),
  },
);

export const calculateDscrTool = tool(
  async ({
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    annualTax,
    interestOnly,
    state,
    fico,
  }) => {
    const quote = solve({
      fico: fico ?? 752,
      value: purchasePrice,
      down: downPaymentPct,
      rent: monthlyRent,
      taxAnnual: annualTax,
      insAnnual: 2400,
      purpose: "purchase",
      state,
      io: interestOnly ?? false,
      ppp: 36,
      originationPct: 0,
    });

    return JSON.stringify({
      rate: quote.rate,
      loanAmount: quote.loan,
      ltv: quote.ltv,
      monthlyPitia: Math.round(quote.piti),
      dscr: quote.dscr,
      qualifies: quote.eligible && quote.dscr >= 1,
      cashToClose: quote.cashToClose,
      reserves: quote.reserves,
      laneLabel: quote.laneLabel,
      cashflow: quote.cashflow,
      coc: quote.coc,
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
      fico: z.number().optional(),
    }),
  },
);

export const runScenarioTool = tool(
  async ({ value, rent, taxAnnual, fico, down, goal }) => {
    const deal = {
      value,
      monthlyRent: rent,
      intel: { marketValue: value, annualTax: taxAnnual, state: "NY" },
      fico: fico ?? 752,
      downPaymentPct: down ?? 25,
      purpose: "purchase" as const,
    } as DealState;
    const result = runScenarioEngine(deal, goal ?? "return");
    return JSON.stringify({
      recommended: result.recommended,
      leaders: result.leaders,
      constraints: result.constraints,
      eligibleCount: result.eligibleRows.length,
    });
  },
  {
    name: "run_scenario",
    description:
      "Run the scenario engine: compare down payments and products, return recommended structure and objective leaders.",
    schema: z.object({
      value: z.number(),
      rent: z.number(),
      taxAnnual: z.number(),
      fico: z.number().optional(),
      down: z.number().optional(),
      goal: z
        .enum(["cash-flow", "capital-efficiency", "return", "dscr", "lowest-rate", "lowest-payment"])
        .optional(),
    }),
  },
);

export const searchKnowledgeBaseTool = tool(
  async ({ query }, config: ToolConfig) => {
    writeProgress(config, "Searching lending knowledge…");
    const { ensureKnowledgeSourcesRegistered } = await import(
      "@/lib/knowledge-sources"
    );
    ensureKnowledgeSourcesRegistered();

    const results = await searchAllKnowledgeSources(query, 5);
    if (!results.length) {
      return JSON.stringify({
        found: false,
        message: "No knowledge base results. Use product facts from system prompt.",
      });
    }

    const content = results
      .map((r) => `[${r.title}]\n${r.content}`)
      .join("\n\n---\n\n");

    return JSON.stringify({
      found: true,
      content,
      citations: results.map((r) => ({ title: r.title, source: r.sourceId })),
    });
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
    const result = evaluateFundingLane({
      state: state.toUpperCase(),
      vesting: borrowerType,
    });

    return JSON.stringify({
      state,
      eligible: result.lane === "broker-direct",
      lane: result.lane,
      message: result.message,
      blockers: result.blockers,
      lenderId: result.lenderId,
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

export const saveUserPreferenceTool = tool(
  async ({ preference }, config: ToolConfig) => {
    const container = memoryContainerFromConfig(config);
    await saveUserPreference(container, preference);
    return JSON.stringify({ saved: true, preference });
  },
  {
    name: "save_user_preference",
    description:
      "Save a durable user preference (e.g. preferred state, entity type) for this chat session or logged-in user.",
    schema: z.object({
      preference: z.string().describe("Short preference fact to remember"),
    }),
  },
);

export const recallUserContextTool = tool(
  async ({ query }, config: ToolConfig) => {
    const container = memoryContainerFromConfig(config);
    const context = await recallUserContext(container, query);
    return JSON.stringify({
      found: Boolean(context),
      context: context || "No prior context for this user/session.",
    });
  },
  {
    name: "recall_user_context",
    description:
      "Recall prior conversation context and preferences for the current user or session.",
    schema: z.object({
      query: z.string().describe("What to recall from memory"),
    }),
  },
);

export const nestTools = [
  lookupPropertyTool,
  getRateQuoteTool,
  calculateDscrTool,
  runScenarioTool,
  searchKnowledgeBaseTool,
  checkStateEligibilityTool,
  saveUserPreferenceTool,
  recallUserContextTool,
];
