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

export function parseUsAddress(input: string): ParsedAddress | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

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
    county: city,
    state,
    unitNumber,
    zip,
  };
}
