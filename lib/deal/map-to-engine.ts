import type { DealInput, DealPurpose, ProductType, PropertyType } from "@/lib/vn-engine";
import type { DealState, ProductChoice } from "./types";

export function mapPurpose(purpose?: DealState["purpose"]): DealPurpose {
  if (purpose === "cashout") return "cashout";
  if (purpose === "rt") return "rt";
  return "purchase";
}

export function mapProduct(product?: ProductChoice): ProductType {
  if (product === "arm76") return "arm76";
  return "fx30";
}

export function mapPropertyType(
  intel?: { propertyType?: string; units?: number },
): PropertyType {
  const t = intel?.propertyType?.toLowerCase() ?? "";
  if (t.includes("condo")) return "condo";
  if (t.includes("coop") || t.includes("co-op")) return "coop";
  if (
    (intel?.units ?? 1) >= 2 ||
    t.includes("2-4") ||
    t.includes("2to4") ||
    t.includes("multi") ||
    t.includes("duplex") ||
    t.includes("triplex") ||
    t.includes("fourplex")
  ) {
    return "2to4";
  }
  return "sfr";
}

export function mapPrepayMonths(prepay?: string | number): number {
  if (typeof prepay === "number") return prepay;
  if (prepay === "5yr") return 60;
  if (prepay === "none") return 0;
  return 36;
}

export function dealToEngineInput(deal: DealState, overrides: Partial<DealInput> = {}): DealInput {
  const value = overrides.value ?? deal.value ?? deal.intel?.marketValue ?? 0;
  const down = overrides.down ?? deal.downPaymentPct ?? 25;

  return {
    fico: deal.ficoUnknown ? 700 : (deal.fico ?? 700),
    value,
    down,
    rent: overrides.rent ?? deal.monthlyRent ?? deal.intel?.estimatedRent ?? 0,
    taxAnnual: deal.intel?.annualTax ?? 0,
    insAnnual: overrides.insAnnual ?? deal.insuranceAnnual ?? 2400,
    purpose: mapPurpose(overrides.purpose ?? deal.purpose),
    propertyType: mapPropertyType(deal.intel),
    state: deal.intel?.state ?? overrides.state,
    county: deal.intel?.county ?? overrides.county,
    city: deal.intel?.city ?? overrides.city,
    ppp: overrides.ppp ?? deal.ppp ?? mapPrepayMonths("3yr"),
    io: overrides.io ?? deal.interestOnly ?? deal.product === "io",
    str: overrides.str ?? deal.str ?? false,
    foreignNational: deal.borrowerType === "foreign",
    escrowWaiver: overrides.escrowWaiver ?? deal.escrowWaiver ?? false,
    assets: deal.assets ?? 0,
    product: mapProduct((overrides.product as ProductChoice | undefined) ?? deal.product),
    originationPct: overrides.originationPct ?? 0,
    ...overrides,
  };
}

export function quoteToTermSheet(quote: import("@/lib/vn-engine").QuoteResult) {
  return {
    rate: quote.rate ?? 0,
    loanAmount: quote.loan,
    ltv: quote.ltv,
    monthlyPitia: Math.round(quote.piti),
    dscr: quote.dscr,
    cashToClose: quote.cashToClose,
    originationPts: 1,
    originationFee: quote.closing.fees.find((f) => f.name.startsWith("Origination"))?.value ?? 0,
    reserves: quote.reserves,
    reservesMonths: 6,
    qualifies: quote.eligible && quote.dscr >= 1,
    termLabel: "30yr Fixed",
    prepayLabel: "3 year",
    laneLabel: quote.laneLabel,
    pointsPct: quote.pointsPct,
    cashflow: quote.cashflow,
    coc: quote.coc,
    breakdown: quote.breakdown,
    closing: quote.closing,
  };
}
