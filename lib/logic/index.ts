import { createServiceClient } from "@/lib/supabase/service";
import type { RateSettings } from "@/lib/dscr";
import {
  buildDefaultParsedRules,
  buildDefaultStateMatrix,
  getFundedStateCodes,
} from "./defaults";
import type {
  ParsedLogicRules,
  StateCheckResult,
  StateEligibilityEntry,
} from "./types";

let cachedRules: ParsedLogicRules | null = null;
let cacheExpiry = 0;

export async function getActiveLogicRules(): Promise<ParsedLogicRules> {
  if (cachedRules && Date.now() < cacheExpiry) return cachedRules;

  const service = createServiceClient();
  if (!service) {
    cachedRules = buildDefaultParsedRules();
    cacheExpiry = Date.now() + 60_000;
    return cachedRules;
  }

  const { data: settings } = await service
    .from("admin_settings")
    .select("state_eligibility, rate_settings")
    .eq("id", 1)
    .single();

  let logicDocs: { parsed_rules: unknown }[] | null = null;
  try {
    const { data } = await service
      .from("logic_documents")
      .select("parsed_rules, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);
    logicDocs = data;
  } catch {
    logicDocs = null;
  }

  const base = buildDefaultParsedRules();
  const fromDoc = logicDocs?.[0]?.parsed_rules as ParsedLogicRules | null;

  if (fromDoc) {
    Object.assign(base, fromDoc);
  }

  const stateEligibility = settings?.state_eligibility as StateEligibilityEntry[] | null;
  if (stateEligibility?.length) {
    base.stateMatrix = stateEligibility;
  }

  const rateSettings = settings?.rate_settings as RateSettings | null;
  if (rateSettings && Object.keys(rateSettings).length > 0) {
    base.rateSettings = { ...base.rateSettings, ...rateSettings };
  }

  cachedRules = base;
  cacheExpiry = Date.now() + 60_000;
  return base;
}

export function invalidateLogicCache() {
  cachedRules = null;
  cacheExpiry = 0;
}

export async function getStateMatrix(): Promise<StateEligibilityEntry[]> {
  const rules = await getActiveLogicRules();
  return rules.stateMatrix;
}

export async function checkStateEligibilityDetailed(
  state: string,
  borrowerType?: "llc" | "individual" | "foreign",
): Promise<StateCheckResult> {
  const normalized = state.trim().toUpperCase();
  const rules = await getActiveLogicRules();
  const entry = rules.stateMatrix.find((s) => s.state === normalized);
  const fundedStates = getFundedStateCodes(rules.stateMatrix);

  if (!entry) {
    return {
      eligible: false,
      state: normalized,
      status: "blocked",
      message: `${normalized} is not in the funded state list.`,
      requiresAttestation: false,
      requiresLlc: false,
      fundedStates,
    };
  }

  if (entry.status === "blocked") {
    return {
      eligible: false,
      state: normalized,
      status: "blocked",
      message: `Vested Nest does not fund business-purpose DSCR loans in ${normalized}.`,
      requiresAttestation: false,
      requiresLlc: false,
      fundedStates,
    };
  }

  if (entry.llcOnly && borrowerType === "individual") {
    return {
      eligible: false,
      state: normalized,
      status: "restricted",
      message: `${normalized} requires entity vesting (LLC or Corporation). Individual borrowers are not eligible.`,
      requiresAttestation: entry.brokerAttestation ?? false,
      requiresLlc: true,
      fundedStates,
    };
  }

  const attestationNote = entry.brokerAttestation
    ? " Business Purpose Broker Attestation required."
    : "";

  return {
    eligible: true,
    state: normalized,
    status: entry.status,
    message: `${normalized} is eligible for Vested Nest DSCR lending.${attestationNote}`,
    requiresAttestation: entry.brokerAttestation ?? false,
    requiresLlc: entry.llcOnly ?? false,
    fundedStates,
  };
}

export function formatRulesSummary(rules: ParsedLogicRules): string {
  return rules.summary.join("\n");
}

export { buildDefaultParsedRules, buildDefaultStateMatrix, getFundedStateCodes };
