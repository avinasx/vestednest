import { isStateEligible } from "@/lib/eligibility";
import type { InteractionHandler } from "./registry";
import type { ChatInteraction, EligibilityInteractionData } from "./types";

export const ELIGIBILITY_KIND = "eligibility";

export type EligibilityResolveInput = {
  state: string;
  borrowerType?: "llc" | "individual" | "foreign";
};

export const eligibilityInteractionHandler: InteractionHandler = {
  kind: ELIGIBILITY_KIND,

  async resolve(input) {
    const { state, borrowerType } = input as EligibilityResolveInput;
    const normalized = state?.trim().toUpperCase();
    if (!normalized || normalized.length !== 2) {
      return {
        status: "invalid_input",
        kind: ELIGIBILITY_KIND,
        message: "Enter a two-letter US state code (e.g. GA, FL, TX).",
        source: "eligibility",
      };
    }

    const result = await isStateEligible(normalized, borrowerType);
    const data: EligibilityInteractionData = {
      state: result.state,
      eligible: result.eligible,
      requiresAttestation: result.requiresAttestation,
      requiresLlc: result.requiresLlc,
    };

    if (!result.eligible) {
      return {
        status: "blocked",
        kind: ELIGIBILITY_KIND,
        message: result.message,
        data,
        source: "eligibility",
      };
    }

    return {
      status: "success",
      kind: ELIGIBILITY_KIND,
      message: result.message,
      data,
      source: "eligibility",
    };
  },

  formatError() {
    return "We couldn't check state eligibility right now. Try again in a moment.";
  },
};
