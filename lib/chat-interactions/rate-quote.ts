import { solve } from "@/lib/vn-engine";
import type { InteractionHandler } from "./registry";
import type { ChatInteraction } from "./types";

export const RATE_QUOTE_KIND = "rate_quote";

export type RateQuoteResolveInput = {
  state?: string;
  fico?: number;
  loanAmount?: number;
  value?: number;
  rent?: number;
};

export const rateQuoteInteractionHandler: InteractionHandler = {
  kind: RATE_QUOTE_KIND,

  async resolve(input) {
    const { state, fico, loanAmount, value, rent } = input as RateQuoteResolveInput;

    if (!state || state.trim().length !== 2) {
      return {
        status: "needs_selection",
        kind: RATE_QUOTE_KIND,
        message: "Which state is the property in? Pick one to see indicative rates.",
        options: ["GA", "FL", "TX", "NC", "TN", "AZ", "CO", "OH", "NY"].map((code) => ({
          id: `state-${code}`,
          label: code,
          subtitle: "Live DSCR pricing",
          meta: { state: code, fico, loanAmount, value, rent },
        })),
        source: "rate_engine",
      } satisfies ChatInteraction;
    }

    const price = value ?? 400_000;
    const monthlyRent = rent ?? Math.round(price * 0.012);
    const down = loanAmount ? Math.round((1 - loanAmount / price) * 100) : 25;

    const quote = solve({
      fico: fico ?? 720,
      value: price,
      down: Math.min(40, Math.max(20, down)),
      rent: monthlyRent,
      taxAnnual: Math.round(price * 0.012),
      insAnnual: 2400,
      purpose: "purchase",
      propertyType: "sfr",
      state: state.toUpperCase(),
      ppp: 36,
      io: false,
      str: false,
      foreignNational: false,
      originationPct: 0,
    });

    return {
      status: "success",
      kind: RATE_QUOTE_KIND,
      message: `Indicative ${state.toUpperCase()} DSCR: ${quote.rate?.toFixed(3)}% at ${quote.ltv}% LTV, DSCR ${quote.dscr.toFixed(2)}, payment $${Math.round(quote.piti).toLocaleString()}/mo.`,
      data: {
        state: state.toUpperCase(),
        rate: quote.rate,
        ltv: quote.ltv,
        dscr: quote.dscr,
        monthlyPitia: Math.round(quote.piti),
        cashToClose: quote.cashToClose,
        eligible: quote.eligible,
      },
      source: "rate_engine",
    };
  },

  async resolveSelection(_optionId, meta) {
    const state = typeof meta?.state === "string" ? meta.state : "";
    return rateQuoteInteractionHandler.resolve({
      state,
      fico: typeof meta?.fico === "number" ? meta.fico : undefined,
      loanAmount: typeof meta?.loanAmount === "number" ? meta.loanAmount : undefined,
      value: typeof meta?.value === "number" ? meta.value : undefined,
      rent: typeof meta?.rent === "number" ? meta.rent : undefined,
    });
  },

  formatError() {
    return "Rate lookup is temporarily unavailable. Try again in a moment.";
  },
};
