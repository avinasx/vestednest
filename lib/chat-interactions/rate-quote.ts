import type { InteractionHandler } from "./registry";
import type { ChatInteraction } from "./types";

export const RATE_QUOTE_KIND = "rate_quote";

export type RateQuoteResolveInput = {
  state?: string;
  fico?: number;
  loanAmount?: number;
};

/**
 * Minimal stub — returns a typed interaction until a dedicated pricing API is wired.
 */
export const rateQuoteInteractionHandler: InteractionHandler = {
  kind: RATE_QUOTE_KIND,

  async resolve(input) {
    const { state, fico, loanAmount } = input as RateQuoteResolveInput;

    if (!state || state.trim().length !== 2) {
      return {
        status: "needs_selection",
        kind: RATE_QUOTE_KIND,
        message: "Which state is the property in? Pick one to see indicative rates.",
        options: ["GA", "FL", "TX", "NC", "TN", "AZ", "CO", "OH"].map((code) => ({
          id: `state-${code}`,
          label: code,
          subtitle: "Indicative DSCR rates",
          meta: { state: code, fico, loanAmount },
        })),
        source: "rate_engine",
      } satisfies ChatInteraction;
    }

    return {
      status: "success",
      kind: RATE_QUOTE_KIND,
      message: `Indicative DSCR rates for ${state.toUpperCase()} are available once you share a property address — drop an address and I'll quote rate, points, and DSCR live.`,
      data: { state: state.toUpperCase(), fico, loanAmount },
      source: "rate_engine",
    };
  },

  async resolveSelection(_optionId, meta) {
    const state = typeof meta?.state === "string" ? meta.state : "";
    return rateQuoteInteractionHandler.resolve({ state });
  },

  formatError() {
    return "Rate lookup is temporarily unavailable. Try again in a moment.";
  },
};
