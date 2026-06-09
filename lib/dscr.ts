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
  reserveMonths: DEFAULT_RATE_FROM_SHEET.reserveMonths ?? 3,
  ficoBands: DEFAULT_RATE_FROM_SHEET.ficoBands ?? [
    { min: 760, max: 850, adjustment: -0.5 },
    { min: 740, max: 759, adjustment: -0.375 },
    { min: 700, max: 739, adjustment: 0 },
    { min: 680, max: 699, adjustment: 0.25 },
    { min: 660, max: 679, adjustment: 0.5 },
    { min: 620, max: 639, adjustment: 1.0 },
  ],
  borrowerAdjustments: DEFAULT_RATE_FROM_SHEET.borrowerAdjustments ?? {
    llc: 0,
    individual: 0.125,
    foreign: 0.375,
  },
  purposeAdjustments: DEFAULT_RATE_FROM_SHEET.purposeAdjustments ?? {
    purchase: 0,
    cashout: 0.375,
    bridge: 0.125,
    refi: 0.125,
  },
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
    const settings = {
      ...DEFAULT_RATE_SETTINGS,
      ...rules.rateSettings,
    };
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

function termAdjustment(term: LoanTerm, prepay: PrepayPenalty, interestOnly: boolean): number {
  let adj = 0;
  if (term === "5/1") adj -= 0.5;
  if (term === "7/1") adj -= 0.25;
  if (prepay === "none") adj += 0.375;
  if (prepay === "5yr") adj -= 0.25;
  if (interestOnly) adj += 0.125;
  return adj;
}

function ficoAdjustment(fico: number | undefined, bands: RateSettings["ficoBands"]): number {
  if (!fico || !bands?.length) return 0;
  const band = bands.find((b) => fico >= b.min && fico <= b.max);
  return band?.adjustment ?? 0.75;
}

function termLabel(term: LoanTerm): string {
  if (term === "5/1") return "5/1 ARM";
  if (term === "7/1") return "7/1 ARM";
  return "30yr Fixed";
}

function prepayLabel(prepay: PrepayPenalty): string {
  if (prepay === "none") return "None";
  if (prepay === "5yr") return "5 year";
  return "3 year";
}

export function calculateTermSheetWithSettings(
  inputs: LoanInputs,
  settings: RateSettings = DEFAULT_RATE_SETTINGS,
  minDscr = 1.0,
): TermSheet {
  const merged = { ...DEFAULT_RATE_SETTINGS, ...settings };
  const loanAmount = Math.round(inputs.purchasePrice * (1 - inputs.downPaymentPct / 100));
  const ltv = 100 - inputs.downPaymentPct;

  let rate = merged.baseRate ?? 7.99;
  rate += termAdjustment(inputs.term, inputs.prepay, inputs.interestOnly);
  rate += ficoAdjustment(inputs.fico, merged.ficoBands);
  rate += merged.borrowerAdjustments?.[inputs.borrowerType ?? "llc"] ?? 0;
  rate += merged.purposeAdjustments?.[inputs.purpose] ?? 0;
  if (inputs.state && merged.stateAdjustments?.[inputs.state.toUpperCase()]) {
    rate += merged.stateAdjustments[inputs.state.toUpperCase()];
  }

  const mr = rate / 100 / 12;
  const n = 360;
  const principalPmt = inputs.interestOnly
    ? loanAmount * mr
    : (loanAmount * (mr * Math.pow(1 + mr, n))) / (Math.pow(1 + mr, n) - 1);

  const taxMonthly = inputs.annualTax / 12;
  const insurance = inputs.insuranceMonthly ?? 120;
  const monthlyPitia = Math.round(principalPmt + taxMonthly + insurance);
  const dscr = monthlyPitia > 0 ? inputs.monthlyRent / monthlyPitia : 0;

  const originationPts = merged.originationPts ?? 1.25;
  const originationFee = Math.round(loanAmount * (originationPts / 100));
  const reserveMonths = merged.reserveMonths ?? 6;
  const reserves = Math.round(monthlyPitia * reserveMonths);
  const downPayment = Math.round(inputs.purchasePrice * (inputs.downPaymentPct / 100));
  const cashToClose =
    downPayment +
    originationFee +
    (merged.appraisalEst ?? 650) +
    (merged.titleFeeEst ?? 1840) +
    reserves;

  return {
    rate: Math.round(rate * 1000) / 1000,
    loanAmount,
    ltv,
    monthlyPitia,
    dscr: Math.round(dscr * 100) / 100,
    cashToClose,
    originationPts,
    originationFee,
    reserves,
    reservesMonths: reserveMonths,
    qualifies: dscr >= minDscr,
    termLabel: termLabel(inputs.term),
    prepayLabel: prepayLabel(inputs.prepay),
  };
}

/** Synchronous calculator using default settings (client-safe). */
export function calculateTermSheet(inputs: LoanInputs): TermSheet {
  return calculateTermSheetWithSettings(inputs, DEFAULT_RATE_SETTINGS);
}

/** Async calculator that loads admin rate_settings when available. */
export async function calculateTermSheetAsync(inputs: LoanInputs): Promise<TermSheet> {
  const [settings, rules] = await Promise.all([getRateSettings(), getActiveLogicRules()]);
  return calculateTermSheetWithSettings(inputs, settings, rules.dscr.minQualifyingDscr);
}

export function estimateMonthlyRent(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * 0.0068);
}

export function estimateArv(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * 1.04);
}
