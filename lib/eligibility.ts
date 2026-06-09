import { createServiceClient } from "@/lib/supabase/service";
import {
  checkStateEligibilityDetailed,
  getActiveLogicRules,
  getFundedStateCodes,
} from "@/lib/logic";
import { buildDefaultStateMatrix } from "@/lib/logic/defaults";
import type { StateCheckResult, StateEligibilityEntry } from "@/lib/logic/types";

const DEFAULT_FUNDED_STATES = getFundedStateCodes(buildDefaultStateMatrix());

export async function getFundedStates(): Promise<string[]> {
  const rules = await getActiveLogicRules();
  return getFundedStateCodes(rules.stateMatrix);
}

export async function getStateMatrix(): Promise<StateEligibilityEntry[]> {
  const rules = await getActiveLogicRules();
  return rules.stateMatrix;
}

export async function isStateEligible(
  state: string,
  borrowerType?: "llc" | "individual" | "foreign",
): Promise<StateCheckResult> {
  return checkStateEligibilityDetailed(state, borrowerType);
}

export function checkStateEligibilitySync(
  state: string,
  fundedStates: string[] = DEFAULT_FUNDED_STATES,
): { eligible: boolean; state: string } {
  const normalized = state.trim().toUpperCase();
  if (normalized === "ND" || normalized === "SD") {
    return { eligible: false, state: normalized };
  }
  return {
    eligible: fundedStates.includes(normalized),
    state: normalized,
  };
}

export async function syncFundedStatesFromDb(): Promise<string[]> {
  const service = createServiceClient();
  if (!service) return DEFAULT_FUNDED_STATES;

  const { data } = await service
    .from("admin_settings")
    .select("funded_states, state_eligibility")
    .eq("id", 1)
    .single();

  const matrix = data?.state_eligibility as StateEligibilityEntry[] | null;
  if (matrix?.length) {
    return getFundedStateCodes(matrix);
  }

  if (data?.funded_states?.length) {
    return data.funded_states.map((s: string) => s.toUpperCase());
  }

  return DEFAULT_FUNDED_STATES;
}
