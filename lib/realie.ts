import type { ParsedAddress } from "./address";

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
  if (parsed.city) {
    baseParams.city = parsed.city;
    baseParams.county = parsed.county ?? parsed.city;
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
    ...baseParams,
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
