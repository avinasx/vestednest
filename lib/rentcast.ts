import type { RentComp } from "./property-intel";

const RENTCAST_BASE = "https://api.rentcast.io/v1";

export type RentCastSubjectProperty = {
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
};

export type RentCastComparable = {
  formattedAddress?: string;
  addressLine1?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  price?: number;
  daysOld?: number;
  distance?: number;
};

export type RentCastRentEstimate = {
  rent: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  subjectProperty?: RentCastSubjectProperty;
  comparables?: RentCastComparable[];
};

export type RentCastValueEstimate = {
  price: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  subjectProperty?: RentCastSubjectProperty;
};

export type RentCastPropertyRecord = RentCastSubjectProperty & {
  id?: string;
  taxAssessments?: Record<string, { value?: number }>;
  propertyTaxes?: Record<string, { total?: number }>;
};

export type RentCastEnrichment = {
  estimatedRent: number | null;
  marketValue: number | null;
  rentComps: RentComp[];
  subjectProperty: RentCastSubjectProperty | null;
  source: "rentcast" | null;
};

function getApiKey(): string {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) throw new Error("RENTCAST_API_KEY is not configured");
  return key;
}

async function rentcastFetch<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(`${RENTCAST_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": getApiKey() },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as T | null;
}

/** Full address: Street, City, State, Zip */
export function formatRentCastAddress(parts: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string | null {
  const { street, city, state, zip } = parts;
  if (!street?.trim() || !city?.trim() || !state?.trim()) return null;
  const zipPart = zip?.trim() ? `, ${zip.trim()}` : "";
  return `${street.trim()}, ${city.trim()}, ${state.trim()}${zipPart}`;
}

function compToRentComp(c: RentCastComparable): RentComp {
  const addr = c.formattedAddress ?? c.addressLine1 ?? "Comparable";
  const beds = c.bedrooms ?? "?";
  const baths = c.bathrooms ?? "?";
  const sqft = c.squareFootage ? `${c.squareFootage.toLocaleString()} sqft` : "—";
  const dist = c.distance != null ? `${c.distance.toFixed(1)} mi` : "—";
  return {
    address: addr.split(",")[0] ?? addr,
    details: `${c.propertyType ?? "SFR"} · ${beds}bd/${baths}ba · ${sqft} · ${dist}`,
    rent: Math.round(c.price ?? 0),
    daysAgo: c.daysOld ?? 30,
  };
}

export async function fetchRentEstimate(
  address: string,
  opts?: { bedrooms?: number; bathrooms?: number; squareFootage?: number; propertyType?: string },
): Promise<RentCastRentEstimate | null> {
  const params: Record<string, string> = { address, compCount: "5" };
  if (opts?.bedrooms != null) params.bedrooms = String(opts.bedrooms);
  if (opts?.bathrooms != null) params.bathrooms = String(opts.bathrooms);
  if (opts?.squareFootage != null) params.squareFootage = String(opts.squareFootage);
  if (opts?.propertyType) params.propertyType = opts.propertyType;

  return rentcastFetch<RentCastRentEstimate>("/avm/rent/long-term", params);
}

export async function fetchValueEstimate(
  address: string,
  opts?: { bedrooms?: number; bathrooms?: number; squareFootage?: number; propertyType?: string },
): Promise<RentCastValueEstimate | null> {
  const params: Record<string, string> = { address, compCount: "5" };
  if (opts?.bedrooms != null) params.bedrooms = String(opts.bedrooms);
  if (opts?.bathrooms != null) params.bathrooms = String(opts.bathrooms);
  if (opts?.squareFootage != null) params.squareFootage = String(opts.squareFootage);
  if (opts?.propertyType) params.propertyType = opts.propertyType;

  return rentcastFetch<RentCastValueEstimate>("/avm/value", params);
}

export async function fetchPropertyRecord(address: string): Promise<RentCastPropertyRecord | null> {
  const results = await rentcastFetch<RentCastPropertyRecord[]>("/properties", {
    address,
    limit: "1",
  });
  if (!Array.isArray(results) || results.length === 0) return null;
  return results[0] ?? null;
}

/** Rent + value enrichment from RentCast when Realie data is weak. */
export async function enrichFromRentCast(
  address: string,
  hints?: { bedrooms?: number | null; bathrooms?: number | null; sqft?: number | null },
): Promise<RentCastEnrichment> {
  const empty: RentCastEnrichment = {
    estimatedRent: null,
    marketValue: null,
    rentComps: [],
    subjectProperty: null,
    source: null,
  };

  try {
    const opts = {
      bedrooms: hints?.bedrooms ?? undefined,
      bathrooms: hints?.bathrooms ?? undefined,
      squareFootage: hints?.sqft ?? undefined,
      propertyType: "Single Family",
    };

    const [rentEst, valueEst] = await Promise.all([
      fetchRentEstimate(address, opts),
      fetchValueEstimate(address, opts),
    ]);

    if (!rentEst && !valueEst) return empty;

    const rentComps = (rentEst?.comparables ?? [])
      .filter((c) => (c.price ?? 0) > 0)
      .slice(0, 3)
      .map(compToRentComp);

    return {
      estimatedRent: rentEst?.rent && rentEst.rent > 0 ? Math.round(rentEst.rent) : null,
      marketValue: valueEst?.price && valueEst.price > 0 ? Math.round(valueEst.price) : null,
      rentComps,
      subjectProperty: rentEst?.subjectProperty ?? valueEst?.subjectProperty ?? null,
      source: "rentcast",
    };
  } catch {
    return empty;
  }
}
