import type { QuoteResult } from "@/lib/vn-engine";
import type { PropertyIntel } from "@/lib/property-intel";

export type FundingLane = "broker-direct" | "ecc-referral" | "excluded";

export type HoldPeriod = "2-3" | "5" | "7" | "10+" | "not-sure";

export type BorrowerGoal =
  | "cash-flow"
  | "capital-efficiency"
  | "return"
  | "dscr"
  | "lowest-rate"
  | "lowest-payment";

export type ProductChoice = "fx30" | "arm76" | "io";

export type DealPurpose = "purchase" | "rt" | "cashout";

export type ScenarioRow = {
  id: string;
  down: number;
  ltv: number;
  loan: number;
  product: ProductChoice;
  io: boolean;
  rate: number | null;
  pointsPct: number | null;
  payment: number;
  cashToClose: number;
  dscr: number;
  cashFlow: number;
  annualCashFlow: number;
  coc: number;
  reserves: number;
  ppp: number;
  eligible: boolean;
  laneLabel: string;
  quote: QuoteResult;
};

export type DealState = {
  id?: string;
  sessionId?: string;
  formattedAddress?: string;
  intel?: PropertyIntel;
  fico?: number;
  ficoUnknown?: boolean;
  borrowerType?: "llc" | "individual" | "foreign";
  purpose?: DealPurpose;
  str?: boolean;
  assets?: number;
  monthlyRent?: number;
  insuranceAnnual?: number;
  value?: number;
  downPaymentPct?: number;
  product?: ProductChoice;
  interestOnly?: boolean;
  ppp?: number;
  escrowWaiver?: boolean;
  holdPeriod?: HoldPeriod;
  borrowerGoal?: BorrowerGoal;
  selectedRate?: number;
  scenarioSelection?: ScenarioRow;
  fundingLane?: FundingLane;
  lenderId?: string;
  quote?: QuoteResult;
  applicationId?: string;
  utm?: Record<string, string>;
  clickIds?: Record<string, string>;
};

export type UtmCapture = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  msclkid?: string;
};
