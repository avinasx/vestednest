import {
  buildPropertySearchParams,
  type ParsedAddress,
} from "./address";

const REALIE_BASE = "https://app.realie.ai/api";

export type RealieLookupResult = {
  property: Record<string, unknown> | null;
  error: string | null;
  source: "address" | "search" | null;
};

export type MatchCriteria = {
  streetAddress?: string;
  city?: string | null;
  zip?: string | null;
  state?: string;
};

function getApiKey() {
  const key = process.env.REALIE_API_KEY;
  if (!key) {
    throw new Error("REALIE_API_KEY is not configured");
  }
  return key;
}

async function realieFetch(path: string, params: Record<string, string>) {
  const url = new URL(`${REALIE_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: getApiKey() },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  return { response, body };
}

function readNum(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
      return Number(v);
    }
  }
  return null;
}

function propertyStreet(p: Record<string, unknown>): string {
  const line1 =
    (typeof p.addressLine1 === "string" && p.addressLine1) ||
    (typeof p.address === "string" && p.address) ||
    "";
  if (line1) return line1.toLowerCase();

  const num = typeof p.streetNumber === "string" ? p.streetNumber : "";
  const street = typeof p.street === "string" ? p.street : "";
  return `${num} ${street}`.trim().toLowerCase();
}

/** Parcel has assessor/building data worth showing (not a bare vacant lot stub). */
export function propertyHasUsefulData(p: Record<string, unknown>): boolean {
  const mv = readNum(p, [
    "totalMarketValue",
    "totalAssessedValue",
    "marketValue",
  ]);
  const beds = readNum(p, ["totalBedrooms", "bedrooms"]);
  const sqft = readNum(p, ["buildingArea", "livingArea", "squareFeet"]);
  const buildingValue = readNum(p, ["assessedBuildingValue", "totalBuildingValue"]);
  const hasCity = typeof p.city === "string" && p.city.trim().length > 0;
  const hasZip = typeof p.zipCode === "string" && p.zipCode.trim().length > 0;
  const streetNum = p.streetNumber;
  const isZeroParcel = streetNum === "0" || streetNum === 0;

  if ((mv ?? 0) > 0 || (beds ?? 0) > 0 || (sqft ?? 0) > 0 || (buildingValue ?? 0) > 0) {
    return true;
  }

  return hasCity && hasZip && !isZeroParcel;
}

export function scorePropertyMatch(
  p: Record<string, unknown>,
  criteria: MatchCriteria,
): number {
  let score = 0;
  const queryStreet = (criteria.streetAddress ?? "").trim().toLowerCase();
  const propStreet = propertyStreet(p);

  if (queryStreet && propStreet) {
    if (propStreet === queryStreet) score += 100;
    else if (propStreet.includes(queryStreet) || queryStreet.includes(propStreet)) {
      score += 60;
    } else {
      const qTokens = new Set(queryStreet.split(/\s+/).filter(Boolean));
      const overlap = propStreet
        .split(/\s+/)
        .filter((t) => qTokens.has(t)).length;
      score += overlap * 12;
    }
  }

  if (criteria.city && typeof p.city === "string") {
    if (p.city.toLowerCase() === criteria.city.toLowerCase()) score += 45;
  }

  if (criteria.zip && typeof p.zipCode === "string") {
    if (p.zipCode.startsWith(criteria.zip.slice(0, 5))) score += 35;
  }

  if (criteria.state && typeof p.state === "string") {
    if (p.state.toUpperCase() === criteria.state.toUpperCase()) score += 10;
  }

  if (propertyHasUsefulData(p)) score += 30;

  const streetNum = p.streetNumber;
  if ((streetNum === "0" || streetNum === 0) && !propertyHasUsefulData(p)) {
    score -= 80;
  }

  if (!p.city) score -= 25;
  if (!p.zipCode) score -= 10;

  return score;
}

export function pickBestProperty(
  properties: unknown[],
  criteria: MatchCriteria,
): Record<string, unknown> | null {
  const scored = properties
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .map((p) => ({ p, score: scorePropertyMatch(p, criteria) }))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0];
  if (best.score < 5) return null;
  return best.p;
}

function matchCriteriaFromParsed(parsed: ParsedAddress): MatchCriteria {
  return {
    streetAddress: parsed.streetAddress,
    city: parsed.city,
    zip: parsed.zip,
    state: parsed.state,
  };
}

export async function lookupProperty(
  parsed: ParsedAddress,
): Promise<RealieLookupResult> {
  const criteria = matchCriteriaFromParsed(parsed);
  const baseParams: Record<string, string> = {
    state: parsed.state,
    address: parsed.streetAddress,
  };

  if (parsed.unitNumber) {
    baseParams.unitNumberStripped = parsed.unitNumber;
  }
  // Realie requires county when city is set on address lookup.
  if (parsed.city && parsed.county) {
    baseParams.city = parsed.city;
    if (parsed.county !== parsed.city) {
      baseParams.county = parsed.county;
    }
  }

  const addressLookup = await realieFetch(
    "/public/property/address/",
    baseParams,
  );

  if (addressLookup.response.ok) {
    const property = addressLookup.body.property;
    if (property && typeof property === "object") {
      return {
        property: property as Record<string, unknown>,
        error: null,
        source: "address",
      };
    }
  }

  if (
    addressLookup.response.status !== 404 &&
    addressLookup.response.status !== 400
  ) {
    const err =
      typeof addressLookup.body.error === "string"
        ? addressLookup.body.error
        : `Realie address lookup failed (${addressLookup.response.status})`;
    return { property: null, error: err, source: null };
  }

  const searchParams: Record<string, string> = {
    state: parsed.state,
    query: parsed.streetAddress,
    limit: "20",
  };
  if (parsed.city) searchParams.city = parsed.city;

  const search = await realieFetch("/public/property/search/", searchParams);

  if (search.response.ok) {
    const properties = search.body.properties;
    if (Array.isArray(properties) && properties.length > 0) {
      const best = pickBestProperty(properties, criteria);
      if (best) {
        return { property: best, error: null, source: "search" };
      }
    }
  }

  const searchErr =
    typeof search.body.error === "string"
      ? search.body.error
      : typeof addressLookup.body.error === "string"
        ? addressLookup.body.error
        : "Property not found for this address";

  return { property: null, error: searchErr, source: null };
}

export type AddressSuggestion = {
  id: string;
  label: string;
  streetAddress: string;
  city: string | null;
  state: string;
  zip: string | null;
  county: string | null;
  /** Full Realie search hit — used on submit so we do not re-lookup and miss. */
  property: Record<string, unknown>;
};

function formatSuggestion(
  property: Record<string, unknown>,
  index: number,
): AddressSuggestion | null {
  const state =
    (typeof property.state === "string" && property.state) || "";
  const label =
    (typeof property.addressFull === "string" && property.addressFull) ||
    (typeof property.addressFullUSPS === "string" &&
      property.addressFullUSPS) ||
    (typeof property.address === "string" && property.address) ||
    "";

  if (!label || !state) return null;

  const streetAddress =
    (typeof property.addressLine1 === "string" && property.addressLine1) ||
    (typeof property.address === "string" && property.address) ||
    label.split(",")[0]?.trim() ||
    label;

  return {
    id:
      (typeof property.state_parcelIdSTD === "string" &&
        property.state_parcelIdSTD) ||
      (typeof property._id === "string" && property._id) ||
      `${state}-${index}-${streetAddress}`,
    label,
    streetAddress,
    city: typeof property.city === "string" ? property.city : null,
    state,
    zip: typeof property.zipCode === "string" ? property.zipCode : null,
    county: typeof property.county === "string" ? property.county : null,
    property,
  };
}

/** Partial street search — requires 2-letter state (Realie property search). */
export async function searchAddressSuggestions(
  query: string,
  state: string,
  limit = 8,
): Promise<{ suggestions: AddressSuggestion[]; error: string | null }> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { suggestions: [], error: null };
  }

  const searchParams = buildPropertySearchParams(trimmed, state);
  const { address: searchQuery, ...rest } = searchParams;
  const fetchLimit = Math.min(Math.max(limit * 3, 15), 20);

  const { response, body } = await realieFetch("/public/property/search/", {
    ...rest,
    query: searchQuery,
    limit: String(fetchLimit),
  });

  if (!response.ok) {
    const err =
      typeof body.error === "string"
        ? body.error
        : `Address search failed (${response.status})`;
    return { suggestions: [], error: err };
  }

  const properties = body.properties;
  if (!Array.isArray(properties)) {
    return { suggestions: [], error: null };
  }

  const criteria: MatchCriteria = {
    streetAddress: searchQuery,
    city: rest.city ?? null,
    state: rest.state ?? state,
  };

  const ranked = properties
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .map((p) => ({ p, score: scorePropertyMatch(p, criteria) }))
    .filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p);

  const suggestions = ranked
    .map((p, i) => formatSuggestion(p, i))
    .filter((s): s is AddressSuggestion => s !== null);

  const seen = new Set<string>();
  const unique = suggestions.filter((s) => {
    if (seen.has(s.label)) return false;
    seen.add(s.label);
    return true;
  });

  return { suggestions: unique.slice(0, limit), error: null };
}

/** Nearby rentals/comps in the same city/zip with real assessor data. */
export async function searchNearbyProperties(
  property: Record<string, unknown>,
  limit = 4,
): Promise<Record<string, unknown>[]> {
  const state = typeof property.state === "string" ? property.state : "";
  const city = typeof property.city === "string" ? property.city : "";
  const zip = typeof property.zipCode === "string" ? property.zipCode : "";
  const parcelId = property.state_parcelIdSTD;
  if (!state) return [];

  const streetQuery =
    (typeof property.street === "string" && property.street) ||
    (typeof property.streetName === "string" && property.streetName) ||
    (typeof property.addressLine1 === "string" ? property.addressLine1 : "") ||
    city;

  const searchParams: Record<string, string> = {
    state,
    query: streetQuery,
    limit: "20",
  };
  if (city) searchParams.city = city;

  const { response, body } = await realieFetch(
    "/public/property/search/",
    searchParams,
  );

  if (!response.ok || !Array.isArray(body.properties)) return [];

  return body.properties
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .filter((p) => p.state_parcelIdSTD !== parcelId)
    .filter((p) => propertyHasUsefulData(p))
    .filter(
      (p) =>
        !zip ||
        (typeof p.zipCode === "string" &&
          p.zipCode.slice(0, 3) === zip.slice(0, 3)),
    )
    .slice(0, limit);
}
