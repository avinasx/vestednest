import { solve } from "@/lib/vn-engine";
import { quoteToTermSheet } from "@/lib/deal/map-to-engine";
import { getActiveLogicRules } from "@/lib/logic";
import { DEFAULT_RATE_FROM_SHEET } from "@/lib/logic/defaults";

export type LoanPurpose = "purchase" | "cashout" | "bridge" | "refi";
export type LoanTerm = "30yr" | "5/1" | "7/1";
export type PrepayPenalty = "none" | "3yr" | "5yr";
export type BorrowerType = "llc" | "individual" | "foreign";

export type RateSettings = {
  baseRate?: number;
  originationPts?: number;
  appraisalEst?: number;
  titleFeeEst?: number;
  reserveMonths?: number;
  ficoBands?: { min: number; max: number; adjustment: number }[];
  borrowerAdjustments?: Partial<Record<BorrowerType, number>>;
  purposeAdjustments?: Partial<Record<LoanPurpose, number>>;
  stateAdjustments?: Record<string, number>;
};

export type LoanInputs = {
  purchasePrice: number;
  downPaymentPct: number;
  monthlyRent: number;
  annualTax: number;
  insuranceMonthly?: number;
  purpose: LoanPurpose;
  term: LoanTerm;
  prepay: PrepayPenalty;
  interestOnly: boolean;
  fico?: number;
  borrowerType?: BorrowerType;
  state?: string;
};

export type TermSheet = {
  rate: number;
  loanAmount: number;
  ltv: number;
  monthlyPitia: number;
  dscr: number;
  cashToClose: number;
  originationPts: number;
  originationFee: number;
  reserves: number;
  reservesMonths: number;
  qualifies: boolean;
  termLabel: string;
  prepayLabel: string;
  laneLabel?: string;
  pointsPct?: number | null;
  cashflow?: number;
  coc?: number;
};

const DEFAULT_RATE_SETTINGS: Required<
  Pick<
    RateSettings,
    | "baseRate"
    | "originationPts"
    | "appraisalEst"
    | "titleFeeEst"
    | "reserveMonths"
    | "ficoBands"
    | "borrowerAdjustments"
    | "purposeAdjustments"
  >
> = {
  baseRate: DEFAULT_RATE_FROM_SHEET.baseRate ?? 6.5,
  originationPts: DEFAULT_RATE_FROM_SHEET.originationPts ?? 1.0,
  appraisalEst: DEFAULT_RATE_FROM_SHEET.appraisalEst ?? 650,
  titleFeeEst: DEFAULT_RATE_FROM_SHEET.titleFeeEst ?? 1840,
  reserveMonths: DEFAULT_RATE_FROM_SHEET.reserveMonths ?? 6,
  ficoBands: DEFAULT_RATE_FROM_SHEET.ficoBands ?? [],
  borrowerAdjustments: DEFAULT_RATE_FROM_SHEET.borrowerAdjustments ?? {},
  purposeAdjustments: DEFAULT_RATE_FROM_SHEET.purposeAdjustments ?? {},
};

export type DscrQualification = {
  minDscr: number;
  qualifies: boolean;
  nearDscrEligible: boolean;
};

let cachedRateSettings: RateSettings | null = null;
let cacheExpiry = 0;

export async function getRateSettings(): Promise<RateSettings> {
  if (cachedRateSettings && Date.now() < cacheExpiry) return cachedRateSettings;
  try {
    const rules = await getActiveLogicRules();
    const settings = { ...DEFAULT_RATE_SETTINGS, ...rules.rateSettings };
    cachedRateSettings = settings;
    cacheExpiry = Date.now() + 60_000;
    return settings;
  } catch {
    return DEFAULT_RATE_SETTINGS;
  }
}

export async function getMinDscrThreshold(): Promise<number> {
  const rules = await getActiveLogicRules();
  return rules.dscr.minQualifyingDscr;
}

export function evaluateDscrQualification(
  dscr: number,
  minDscr = 1.0,
  nearMin = 0.75,
): DscrQualification {
  return {
    minDscr,
    qualifies: dscr >= minDscr,
    nearDscrEligible: dscr >= nearMin && dscr < minDscr,
  };
}

function mapPurpose(purpose: LoanPurpose): "purchase" | "rt" | "cashout" {
  if (purpose === "cashout") return "cashout";
  if (purpose === "refi" || purpose === "bridge") return "rt";
  return "purchase";
}

function mapPrepay(prepay: PrepayPenalty): number {
  if (prepay === "5yr") return 60;
  if (prepay === "none") return 0;
  return 36;
}

function termLabel(term: LoanTerm): string {
  if (term === "5/1") return "5/1 ARM";
  if (term === "7/1") return "7/6 ARM";
  return "30yr Fixed";
}

function prepayLabel(prepay: PrepayPenalty): string {
  if (prepay === "none") return "None";
  if (prepay === "5yr") return "5 year";
  return "3 year";
}

function inputsToEngine(inputs: LoanInputs) {
  return {
    fico: inputs.fico ?? 752,
    value: inputs.purchasePrice,
    down: inputs.downPaymentPct,
    rent: inputs.monthlyRent,
    taxAnnual: inputs.annualTax,
    insAnnual: (inputs.insuranceMonthly ?? 120) * 12,
    purpose: mapPurpose(inputs.purpose),
    state: inputs.state,
    ppp: mapPrepay(inputs.prepay),
    io: inputs.interestOnly,
    foreignNational: inputs.borrowerType === "foreign",
    product: inputs.term === "7/1" ? ("arm76" as const) : ("fx30" as const),
    originationPct: 0,
  };
}

/** All pricing delegates to vn-engine — settings param kept for API compat. */
export function calculateTermSheetWithSettings(
  inputs: LoanInputs,
  _settings: RateSettings = DEFAULT_RATE_SETTINGS,
  minDscr = 1.0,
): TermSheet {
  const quote = solve(inputsToEngine(inputs));
  const sheet = quoteToTermSheet(quote);
  return {
    ...sheet,
    qualifies: quote.eligible && quote.dscr >= minDscr,
    termLabel: termLabel(inputs.term),
    prepayLabel: prepayLabel(inputs.prepay),
  };
}

export function calculateTermSheet(inputs: LoanInputs): TermSheet {
  return calculateTermSheetWithSettings(inputs, DEFAULT_RATE_SETTINGS);
}

export async function calculateTermSheetAsync(inputs: LoanInputs): Promise<TermSheet> {
  const rules = await getActiveLogicRules();
  return calculateTermSheetWithSettings(inputs, DEFAULT_RATE_SETTINGS, rules.dscr.minQualifyingDscr);
}

export function estimateMonthlyRent(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * 0.0068);
}

export function estimateArv(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * 1.04);
}
