import { createServiceClient } from "@/lib/supabase/service";

const DEFAULT_FUNDED_STATES = [
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "OH", "OK", "OR", "PA", "SC", "TN", "TX", "UT",
  "VA", "WA", "WI", "WY",
];

export async function getFundedStates(): Promise<string[]> {
  const service = createServiceClient();
  if (!service) return DEFAULT_FUNDED_STATES;

  const { data } = await service
    .from("admin_settings")
    .select("funded_states")
    .eq("id", 1)
    .single();

  if (data?.funded_states?.length) {
    return data.funded_states.map((s) => s.toUpperCase());
  }
  return DEFAULT_FUNDED_STATES;
}

export async function isStateEligible(state: string): Promise<{
  eligible: boolean;
  state: string;
  fundedStates: string[];
}> {
  const normalized = state.trim().toUpperCase();
  const fundedStates = await getFundedStates();
  return {
    eligible: fundedStates.includes(normalized),
    state: normalized,
    fundedStates,
  };
}

export function checkStateEligibilitySync(
  state: string,
  fundedStates: string[] = DEFAULT_FUNDED_STATES,
): { eligible: boolean; state: string } {
  const normalized = state.trim().toUpperCase();
  return {
    eligible: fundedStates.includes(normalized),
    state: normalized,
  };
}
