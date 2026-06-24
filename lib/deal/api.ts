import type { QuoteResult } from "@/lib/vn-engine";
import type { DealState, FundingLane } from "./types";
import type { ScenarioEngineResult } from "@/lib/scenario-engine";
import type { EligibilityResult } from "@/lib/eligibility/matrix";
import type { PropertyIntel } from "@/lib/property-intel";
import { mapPropertyType } from "./map-to-engine";

export type PropertyLookupResult = {
  status: string;
  intel: PropertyIntel;
  formattedAddress: string;
  valueRange: { low: number; mid: number; high: number; confidence: string };
  rentRange: { low: number; mid: number; high: number; confidence: string };
  fundingLane: FundingLane;
  funding: EligibilityResult;
};

export async function fetchPropertyLookup(body: {
  address?: string;
  state?: string;
  optionId?: string;
  optionMeta?: Record<string, unknown>;
}): Promise<PropertyLookupResult> {
  const res = await fetch("/api/property-lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? json.message ?? "Property lookup failed");
  return json;
}

export async function fetchPrice(body: Record<string, unknown>): Promise<{ quote: QuoteResult }> {
  const res = await fetch("/api/price", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Pricing failed");
  return json;
}

export type LadderRow = {
  rate: number;
  pointsPct: number;
  payment: number;
  dscr: number;
  cashToClose: number;
  reserves: number;
  pointsDollars: number;
  pi?: number;
};

export async function fetchRateLadder(body: Record<string, unknown>) {
  const res = await fetch("/api/price", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, listRates: true }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Rate ladder failed");
  return json as {
    quote: QuoteResult;
    ladder: Array<{
      rate: number;
      pointsPct: number;
      payment: number;
      dscr: number;
      cashToClose: number;
      reserves: number;
      pointsDollars: number;
    }>;
    parIndex: number;
  };
}

export async function fetchScenario(deal: DealState, goal?: string): Promise<ScenarioEngineResult> {
  const res = await fetch("/api/scenario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deal, goal }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Scenario failed");
  return json;
}

export async function fetchEligibility(state: string, vesting?: string): Promise<EligibilityResult> {
  const res = await fetch("/api/eligibility", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, vesting }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Eligibility failed");
  return json;
}

export function dealToPricePayload(deal: DealState) {
  return {
    fico: deal.ficoUnknown ? 700 : (deal.fico ?? 700),
    value: deal.value ?? deal.intel?.marketValue ?? 0,
    down: deal.downPaymentPct ?? 25,
    rent: deal.monthlyRent ?? deal.intel?.estimatedRent ?? 0,
    taxAnnual: deal.intel?.annualTax ?? 0,
    insAnnual: deal.insuranceAnnual ?? 2400,
    purpose: deal.purpose ?? "purchase",
    propertyType: mapPropertyType(deal.intel),
    state: deal.intel?.state,
    county: deal.intel?.county,
    city: deal.intel?.city,
    ppp: deal.ppp ?? 36,
    io: deal.interestOnly ?? deal.product === "io",
    str: deal.str ?? false,
    foreignNational: deal.borrowerType === "foreign",
    escrowWaiver: deal.escrowWaiver ?? false,
    assets: deal.assets ?? 0,
    product: deal.product === "arm76" ? "arm76" : "fx30",
    originationPct: 0,
  };
}
