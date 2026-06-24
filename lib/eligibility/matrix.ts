export type FundingLane = "broker-direct" | "ecc-referral" | "excluded";

export type LenderRule =
  | { type: "cannot_fund"; states: string[] }
  | { type: "broker_license_required"; states: string[] }
  | { type: "lo_license_required"; states: string[] }
  | { type: "entity_vesting_required"; states: string[] }
  | { type: "funds"; states: string[] };

export type LenderConfig = {
  id: string;
  name: string;
  rules: LenderRule[];
  /** If true, VN can broker directly when rules pass */
  brokerDirectEligible: boolean;
};

/** Panel lender state matrices — update from current lender sheets */
export const LENDER_MATRIX: LenderConfig[] = [
  {
    id: "champions",
    name: "Champions Funding",
    brokerDirectEligible: true,
    rules: [
      { type: "cannot_fund", states: ["ND", "SD"] },
      { type: "broker_license_required", states: ["ID", "MN", "NV", "OR", "UT"] },
      { type: "lo_license_required", states: ["AZ", "CA", "MI", "MT", "VT"] },
      { type: "entity_vesting_required", states: ["VA"] },
      { type: "funds", states: ["*"] },
    ],
  },
  {
    id: "thelender",
    name: "theLender",
    brokerDirectEligible: true,
    rules: [{ type: "funds", states: ["*"] }],
  },
  {
    id: "emporium",
    name: "Emporium",
    brokerDirectEligible: true,
    rules: [{ type: "funds", states: ["*"] }],
  },
  {
    id: "foundation",
    name: "Foundation Mortgage",
    brokerDirectEligible: true,
    rules: [{ type: "funds", states: ["*"] }],
  },
  {
    id: "ahl",
    name: "American Heritage Lending",
    brokerDirectEligible: true,
    rules: [{ type: "funds", states: ["*"] }],
  },
  {
    id: "kiavi",
    name: "Kiavi",
    brokerDirectEligible: true,
    rules: [{ type: "funds", states: ["*"] }],
  },
];

/** VN licensing posture — update when licenses obtained */
export const VN_LICENSES = {
  brokerStates: [] as string[],
  loStates: [] as string[],
};

export type EligibilityInput = {
  state: string;
  vesting?: "llc" | "individual" | "foreign";
};

export type EligibilityResult = {
  lane: FundingLane;
  lenderId: string | null;
  blockers: string[];
  requiredDocs: string[];
  message: string;
};

function stateInList(state: string, list: string[]): boolean {
  return list.includes("*") || list.includes(state.toUpperCase());
}

function evaluateLender(lender: LenderConfig, input: EligibilityInput): EligibilityResult | null {
  const st = input.state.toUpperCase();
  const blockers: string[] = [];

  for (const rule of lender.rules) {
    if (rule.type === "cannot_fund" && stateInList(st, rule.states)) {
      return null;
    }
    if (rule.type === "broker_license_required" && stateInList(st, rule.states)) {
      if (!VN_LICENSES.brokerStates.includes(st)) {
        blockers.push(`Broker license required in ${st}`);
      }
    }
    if (rule.type === "lo_license_required" && stateInList(st, rule.states)) {
      if (!VN_LICENSES.loStates.includes(st)) {
        blockers.push(`LO license required in ${st}`);
      }
    }
    if (rule.type === "entity_vesting_required" && stateInList(st, rule.states)) {
      if (input.vesting !== "llc") {
        blockers.push(`${st} requires LLC or corp vesting`);
      }
    }
  }

  if (blockers.length > 0) {
    return {
      lane: "ecc-referral",
      lenderId: "ecc",
      blockers,
      requiredDocs: ["Government ID", "Entity documents", "Bank statements"],
      message: `For loans in ${st}, we work through our licensed partner — we'll pass your details along and they'll take it from here.`,
    };
  }

  return {
    lane: "broker-direct",
    lenderId: lender.id,
    blockers: [],
    requiredDocs: ["Government ID", "Entity documents", "Bank statements", "Lease or rent roll"],
    message: "Eligible for Vested Nest broker-direct placement.",
  };
}

export function evaluateFundingLane(input: EligibilityInput): EligibilityResult {
  const st = input.state?.toUpperCase();
  if (!st || st.length !== 2) {
    return {
      lane: "excluded",
      lenderId: null,
      blockers: ["Invalid state"],
      requiredDocs: [],
      message: "We couldn't determine the property state.",
    };
  }

  const results: EligibilityResult[] = [];
  for (const lender of LENDER_MATRIX) {
    const r = evaluateLender(lender, input);
    if (r?.lane === "broker-direct") return r;
    if (r) results.push(r);
  }

  const ecc = results.find((r) => r.lane === "ecc-referral");
  if (ecc) return ecc;

  return {
    lane: "excluded",
    lenderId: null,
    blockers: ["No panel lender covers this state"],
    requiredDocs: [],
    message:
      "We can't fund in this state today — leave your info and we'll reach out when options open up.",
  };
}
