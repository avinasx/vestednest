export type LoanPurpose = "purchase" | "cashout" | "bridge";
export type LoanTerm = "30yr" | "5/1" | "7/1";
export type PrepayPenalty = "none" | "3yr" | "5yr";
export type BorrowerType = "llc" | "individual" | "foreign";

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

const ORIGINATION_PTS = 1.25;
const APPRAISAL_EST = 650;
const TITLE_FEE_EST = 1840;
const RESERVE_MONTHS = 6;

function baseRate(term: LoanTerm, prepay: PrepayPenalty, interestOnly: boolean): number {
  let rate = 7.99;
  if (term === "5/1") rate -= 0.5;
  if (term === "7/1") rate -= 0.25;
  if (prepay === "none") rate += 0.375;
  if (prepay === "5yr") rate -= 0.25;
  if (interestOnly) rate += 0.125;
  return rate;
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

export function calculateTermSheet(inputs: LoanInputs): TermSheet {
  const loanAmount = Math.round(inputs.purchasePrice * (1 - inputs.downPaymentPct / 100));
  const ltv = 100 - inputs.downPaymentPct;
  const rate = baseRate(inputs.term, inputs.prepay, inputs.interestOnly);
  const mr = rate / 100 / 12;
  const n = 360;

  const principalPmt = inputs.interestOnly
    ? loanAmount * mr
    : (loanAmount * (mr * Math.pow(1 + mr, n))) / (Math.pow(1 + mr, n) - 1);

  const taxMonthly = inputs.annualTax / 12;
  const insurance = inputs.insuranceMonthly ?? 120;
  const monthlyPitia = Math.round(principalPmt + taxMonthly + insurance);
  const dscr = monthlyPitia > 0 ? inputs.monthlyRent / monthlyPitia : 0;
  const originationFee = Math.round(loanAmount * (ORIGINATION_PTS / 100));
  const reserves = Math.round(monthlyPitia * RESERVE_MONTHS);
  const downPayment = Math.round(inputs.purchasePrice * (inputs.downPaymentPct / 100));
  const cashToClose = downPayment + originationFee + APPRAISAL_EST + TITLE_FEE_EST + reserves;

  return {
    rate,
    loanAmount,
    ltv,
    monthlyPitia,
    dscr: Math.round(dscr * 100) / 100,
    cashToClose,
    originationPts: ORIGINATION_PTS,
    originationFee,
    reserves,
    reservesMonths: RESERVE_MONTHS,
    qualifies: dscr >= 1.0,
    termLabel: termLabel(inputs.term),
    prepayLabel: prepayLabel(inputs.prepay),
  };
}

/** Estimate monthly rent from market value when no AVM is available. */
export function estimateMonthlyRent(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * 0.0068);
}

export function estimateArv(marketValue: number): number {
  if (!marketValue || marketValue <= 0) return 0;
  return Math.round(marketValue * 1.04);
}
