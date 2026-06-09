import type { RateSettings } from "@/lib/dscr";
import type { ParsedLogicRules, StateEligibilityEntry } from "./types";

/** All US states + DC for matrix construction */
const ALL_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

/** Hard-blocked per state licensing survey (business purpose) */
const BLOCKED_STATES = ["ND", "SD"];

/** NJ/NY require Business Purpose Broker Attestation for unlicensed brokers */
const ATTESTATION_STATES = ["NJ", "NY"];

/** VA: licensing not required for properties held in LLC or Corporation */
const LLC_ONLY_STATES = ["VA"];

/** LO license required states from licensing survey */
const LO_LICENSE_STATES = ["AZ", "ID", "MI", "MN", "MT", "NV", "OR", "UT", "VT", "VA"];

/** Broker license required states */
const BROKER_LICENSE_STATES = ["ID", "MN", "NV", "OR", "UT"];

export function buildDefaultStateMatrix(): StateEligibilityEntry[] {
  return ALL_STATES.map((state) => {
    if (BLOCKED_STATES.includes(state)) {
      return {
        state,
        status: "blocked" as const,
        notes: "Business purpose loans not permitted in this state",
      };
    }

    const entry: StateEligibilityEntry = {
      state,
      status: "funded",
      loLicenseRequired: LO_LICENSE_STATES.includes(state),
      brokerLicenseRequired: BROKER_LICENSE_STATES.includes(state),
    };

    if (ATTESTATION_STATES.includes(state)) {
      entry.status = "restricted";
      entry.brokerAttestation = true;
      entry.notes =
        "Business Purpose Broker Attestation required for unlicensed brokers";
    }

    if (LLC_ONLY_STATES.includes(state)) {
      entry.llcOnly = true;
      entry.notes =
        (entry.notes ? entry.notes + "; " : "") +
        "Entity vesting (LLC/Corp) required — individual vesting not eligible";
    }

    return entry;
  });
}

/** Rate settings derived from business-purpose rate sheet (June 8, 2026), sanitized labels */
export const DEFAULT_RATE_FROM_SHEET: RateSettings = {
  baseRate: 6.5,
  originationPts: 1.0,
  appraisalEst: 650,
  titleFeeEst: 1840,
  reserveMonths: 3,
  ficoBands: [
    { min: 760, max: 850, adjustment: -0.5 },
    { min: 740, max: 759, adjustment: -0.375 },
    { min: 720, max: 739, adjustment: -0.25 },
    { min: 700, max: 719, adjustment: 0 },
    { min: 680, max: 699, adjustment: 0.25 },
    { min: 660, max: 679, adjustment: 0.5 },
    { min: 640, max: 659, adjustment: 0.75 },
    { min: 620, max: 639, adjustment: 1.0 },
  ],
  borrowerAdjustments: {
    llc: 0,
    individual: 0.125,
    foreign: 0.375,
  },
  purposeAdjustments: {
    purchase: 0,
    cashout: 0.375,
    bridge: 0.125,
    refi: 0.125,
  },
  stateAdjustments: {
    CT: 0,
    IL: 0,
    NJ: 0,
    NY: -0.25,
  },
};

export function buildDefaultParsedRules(): ParsedLogicRules {
  const stateMatrix = buildDefaultStateMatrix();
  const fundedCount = stateMatrix.filter((s) => s.status !== "blocked").length;

  return {
    dscr: {
      minQualifyingDscr: 1.0,
      nearDscrMin: 0.75,
      superDscrMin: 1.15,
      ltvReductionBelowMinDscr: 5,
    },
    ltv: {
      maxLtvPurchase740Fico: 85,
      maxLtvCashOut740Fico: 75,
      maxLtvForeignNational: 75,
      maxLtvDscrBelow1: 75,
    },
    reserves: {
      monthsUnder1M: { purchase: 0, cashout: 3 },
      monthsOver1M: { purchase: 3, cashout: 6 },
      superProgramMonths: 6,
    },
    stateMatrix,
    rateSettings: DEFAULT_RATE_FROM_SHEET,
    minFico: 620,
    minLoanAmount: 100_000,
    maxLoanAmount: 3_500_000,
    conflicts: [
      {
        id: "nd-sd-funding",
        severity: "error",
        category: "state_eligibility",
        message:
          "Guidelines block ND and SD for business-purpose loans; rate sheet lists them with restrictions",
        guidelineValue: "ND, SD blocked",
        rateSheetValue: "ND, SD listed with prepay buyout restrictions",
      },
      {
        id: "dscr-min-threshold",
        severity: "warning",
        category: "dscr",
        message:
          "Standard DSCR ≥ 1.00 for max LTV; near-DSCR (0.75–0.99) available with reduced LTV caps",
        guidelineValue: "DSCR > 1.00 for Accelerator 1-4",
        rateSheetValue: "theNearNONI supports DSCR < 1.00",
      },
      {
        id: "reserve-months",
        severity: "warning",
        category: "reserves",
        message:
          "Reserve months vary by loan amount and purpose — verify against active program matrix",
        guidelineValue: "6 months default in legacy engine",
        rateSheetValue: "0–6 months per loan amount tier",
      },
    ],
    summary: [
      `State matrix: ${fundedCount} funded/restricted states, ${BLOCKED_STATES.length} hard-blocked (ND, SD)`,
      "DSCR ≥ 1.00 standard qualification; near-DSCR 0.75–0.99 with LTV reduction",
      "NJ/NY require Business Purpose Broker Attestation",
      "VA requires LLC/Corporation entity vesting",
      "Base rate 6.500% (30yr fixed, par) from June 2026 rate sheet",
      "FICO floor 620; loan amounts $100K–$3.5M",
      "Max LTV 85% purchase (740+ FICO, DSCR ≥ 1.00); 75% cash-out",
    ],
    extractedAt: new Date().toISOString(),
    docVersions: {
      guidelines: "03.16.2026",
      rate_sheet: "06.08.2026",
      state_licensing: "09.03.2025",
      program_matrix: "03.16.2026",
    },
  };
}

export function getFundedStateCodes(matrix: StateEligibilityEntry[]): string[] {
  return matrix
    .filter((s) => s.status !== "blocked")
    .map((s) => s.state);
}
