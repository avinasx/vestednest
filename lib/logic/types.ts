import type { BorrowerType, LoanPurpose, RateSettings } from "@/lib/dscr";

export type LogicSourceType =
  | "guidelines"
  | "program_matrix"
  | "state_licensing"
  | "rate_sheet"
  | "prepay_licensing";

export type StateStatus = "funded" | "blocked" | "restricted";

export type StateEligibilityEntry = {
  state: string;
  status: StateStatus;
  brokerAttestation?: boolean;
  llcOnly?: boolean;
  loLicenseRequired?: boolean;
  brokerLicenseRequired?: boolean;
  notes?: string;
};

export type DscrThresholds = {
  minQualifyingDscr: number;
  nearDscrMin: number;
  superDscrMin: number;
  ltvReductionBelowMinDscr: number;
};

export type LtvLimits = {
  maxLtvPurchase740Fico: number;
  maxLtvCashOut740Fico: number;
  maxLtvForeignNational: number;
  maxLtvDscrBelow1: number;
};

export type ReserveRules = {
  monthsUnder1M: { purchase: number; cashout: number };
  monthsOver1M: { purchase: number; cashout: number };
  superProgramMonths: number;
};

export type LogicConflict = {
  id: string;
  severity: "warning" | "error";
  category: string;
  message: string;
  guidelineValue?: string;
  rateSheetValue?: string;
};

export type ParsedLogicRules = {
  dscr: DscrThresholds;
  ltv: LtvLimits;
  reserves: ReserveRules;
  stateMatrix: StateEligibilityEntry[];
  rateSettings: RateSettings;
  minFico: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  conflicts: LogicConflict[];
  summary: string[];
  extractedAt: string;
  docVersions: Record<string, string>;
};

export type LogicDocument = {
  id: string;
  title: string;
  source_type: LogicSourceType;
  file_path: string | null;
  parsed_rules: ParsedLogicRules | null;
  sanitized_content: string | null;
  version: string;
  created_at: string;
  updated_at: string;
};

export type BorrowerEligibilityFlags = {
  vaRequiresLlc: boolean;
  njNyRequiresAttestation: boolean;
};

export type StateCheckResult = {
  eligible: boolean;
  state: string;
  status: StateStatus;
  message: string;
  requiresAttestation: boolean;
  requiresLlc: boolean;
  fundedStates: string[];
};
