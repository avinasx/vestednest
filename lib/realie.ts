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

export async function lookupProperty(
  parsed: ParsedAddress,
): Promise<RealieLookupResult> {
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

  if (addressLookup.response.status !== 404) {
    const err =
      typeof addressLookup.body.error === "string"
        ? addressLookup.body.error
        : `Realie address lookup failed (${addressLookup.response.status})`;
    if (addressLookup.response.status !== 404) {
      return { property: null, error: err, source: null };
    }
  }

  const search = await realieFetch("/public/property/search/", {
    state: parsed.state,
    query: parsed.streetAddress,
    limit: "1",
  });

  if (search.response.ok) {
    const properties = search.body.properties;
    if (Array.isArray(properties) && properties.length > 0) {
      const first = properties[0];
      if (first && typeof first === "object") {
        return {
          property: first as Record<string, unknown>,
          error: null,
          source: "search",
        };
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
  const { response, body } = await realieFetch("/public/property/search/", {
    ...rest,
    query: searchQuery,
    limit: String(Math.min(limit, 20)),
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

  const suggestions = properties
    .map((p, i) =>
      p && typeof p === "object"
        ? formatSuggestion(p as Record<string, unknown>, i)
        : null,
    )
    .filter((s): s is AddressSuggestion => s !== null);

  const seen = new Set<string>();
  const unique = suggestions.filter((s) => {
    if (seen.has(s.label)) return false;
    seen.add(s.label);
    return true;
  });

  return { suggestions: unique, error: null };
}
