const STATE_NAMES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

export type ParsedAddress = {
  streetAddress: string;
  city: string | null;
  county: string | null;
  state: string;
  unitNumber: string | null;
  zip: string | null;
};

function parseStateToken(token: string): string | null {
  const t = token.trim();
  if (t.length === 2) return t.toUpperCase();
  return STATE_NAMES[t.toLowerCase()] ?? null;
}

/** "142 Oak Ridge Dr Atlanta GA 30315" or "Cascade Rd Atlanta GA" (no commas). */
function parseLooseAddress(input: string): ParsedAddress | null {
  let rest = input.trim();
  if (!rest) return null;

  let zip: string | null = null;
  const zipMatch = rest.match(/\s+(\d{5}(?:-\d{4})?)$/);
  if (zipMatch) {
    zip = zipMatch[1];
    rest = rest.slice(0, -zipMatch[0].length).trim();
  }

  const words = rest.split(/\s+/).filter(Boolean);
  if (words.length < 3) return null;

  const lastWord = words[words.length - 1];
  const state = parseStateToken(lastWord);
  if (!state) return null;

  const city = words[words.length - 2];
  let streetAddress = words.slice(0, -2).join(" ").trim();

  let unitNumber: string | null = null;
  const unitMatch = streetAddress.match(
    /\b(?:apt|apartment|unit|ste|suite|#)\s*\.?\s*([\w-]+)\s*$/i,
  );
  if (unitMatch) {
    unitNumber = unitMatch[1];
    streetAddress = streetAddress
      .slice(0, unitMatch.index)
      .replace(/[,\s]+$/, "");
  }

  if (!streetAddress || !city) return null;

  return {
    streetAddress,
    city,
    county: null,
    state,
    unitNumber,
    zip,
  };
}

export function parseUsAddress(input: string): ParsedAddress | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) {
    return parseLooseAddress(trimmed);
  }

  const last = parts[parts.length - 1];
  const stateZipMatch = last.match(
    /^([A-Za-z]{2}|[A-Za-z][A-Za-z\s]+?)\s*(\d{5}(?:-\d{4})?)?$/,
  );

  let state: string | null = null;
  let zip: string | null = null;

  if (stateZipMatch) {
    const rawState = stateZipMatch[1].trim();
    zip = stateZipMatch[2] ?? null;
    if (rawState.length === 2) {
      state = rawState.toUpperCase();
    } else {
      state = STATE_NAMES[rawState.toLowerCase()] ?? null;
    }
    parts.pop();
  }

  if (!state) return null;

  const city = parts.length >= 2 ? parts[parts.length - 1] : null;
  const streetParts =
    parts.length >= 2 ? parts.slice(0, -1) : parts.length === 1 ? parts : [];

  let streetAddress = streetParts.join(", ").trim();
  let unitNumber: string | null = null;

  const unitMatch = streetAddress.match(
    /\b(?:apt|apartment|unit|ste|suite|#)\s*\.?\s*([\w-]+)\s*$/i,
  );
  if (unitMatch) {
    unitNumber = unitMatch[1];
    streetAddress = streetAddress
      .slice(0, unitMatch.index)
      .replace(/[,\s]+$/, "");
  }

  if (!streetAddress) return null;

  return {
    streetAddress,
    city,
    county: null,
    state,
    unitNumber,
    zip,
  };
}

/** Realie property search expects street in `address`, not a full formatted line. */
export function buildPropertySearchParams(
  query: string,
  defaultState: string,
): Record<string, string> {
  const trimmed = query.trim();
  const params: Record<string, string> = {
    state: defaultState.toUpperCase(),
  };

  const parsed = parseUsAddress(trimmed);
  if (parsed) {
    params.address = parsed.streetAddress;
    params.state = parsed.state;
    if (parsed.city) params.city = parsed.city;
    if (parsed.county && parsed.county !== parsed.city) {
      params.county = parsed.county;
    }
    return params;
  }

  if (trimmed.includes(",")) {
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      params.address = parts[0];
      const last = parts[parts.length - 1];
      const stateOnly = last.match(/^([A-Za-z]{2})$/i);
      if (stateOnly) {
        params.state = stateOnly[1].toUpperCase();
        if (parts.length >= 3) params.city = parts[parts.length - 2];
      } else {
        params.city = last;
      }
      return params;
    }
  }

  const loose = parseLooseAddress(trimmed);
  if (loose) {
    params.address = loose.streetAddress;
    params.state = loose.state;
    if (loose.city) params.city = loose.city;
    return params;
  }

  params.address = trimmed;
  return params;
}

export function parsedFromSuggestion(suggestion: {
  streetAddress: string;
  city: string | null;
  county: string | null;
  state: string;
  zip: string | null;
}): ParsedAddress {
  return {
    streetAddress: suggestion.streetAddress,
    city: suggestion.city,
    county: suggestion.county ?? suggestion.city,
    state: suggestion.state.toUpperCase(),
    unitNumber: null,
    zip: suggestion.zip,
  };
}
