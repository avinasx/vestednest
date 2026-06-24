export type DealPurpose = "purchase" | "rt" | "cashout";
export type PropertyType = "sfr" | "condo" | "2to4" | "coop";
export type ProductType = "fx30" | "arm76" | "arm106";
export type InternalLane = "theNONI" | "nearNONI" | "superNoni" | "decline";

export type DealInput = {
  fico: number;
  value: number;
  down?: number;
  rent: number;
  taxAnnual?: number;
  insAnnual?: number;
  hoaMonthly?: number;
  purpose?: DealPurpose;
  propertyType?: PropertyType;
  state?: string;
  county?: string;
  city?: string;
  ppp?: number;
  io?: boolean;
  str?: boolean;
  foreignNational?: boolean;
  escrowWaiver?: boolean;
  term40?: boolean;
  assets?: number;
  cashOut?: number;
  originationPct?: number;
  escrowMonths?: number;
  daysToMonthEnd?: number;
  reserveMonths?: number;
  lock?: number;
  product?: ProductType;
  /** Internal pricing context */
  ltv?: number;
  loan?: number;
  dscr?: number;
  lane?: InternalLane;
};

export type PricePart = { name: string; value: number };

export type PriceAtResult = {
  rate: number;
  parts: PricePart[];
  raw: number;
  cap: number;
  net: number;
  capped: boolean;
  pointsPct: number;
};

export type ClosingFee = { name: string; value: number };

export type ClosingCostsResult = {
  fees: ClosingFee[];
  feeTotal: number;
  prepaids: ClosingFee[];
  prepaidTotal: number;
  down: number;
  cashOut: number;
  reserves: number;
  cashToClose: number;
  isCoop: boolean;
  coopWarning: string | null;
};

export type QuoteResult = {
  ltv: number;
  loan: number;
  lane: InternalLane;
  laneLabel: string;
  eligible: boolean;
  reason: string;
  rate: number | null;
  price: number | null;
  pointsPct: number | null;
  capped: boolean;
  breakdown: PricePart[];
  pay: number;
  ti: number;
  piti: number;
  dscr: number;
  superFinal: number;
  superEligible: boolean;
  maxLtv: number | null;
  downAmt: number;
  points: number;
  fees: number;
  cashToClose: number;
  reserves: number;
  closing: ClosingCostsResult;
  cashflow: number;
  coc: number;
};
