/**
 * Central sanitization for lender-confidential content before storage, indexing, or agent output.
 * Strips wholesale lender names, vendor contacts, and common PII patterns.
 */

const LENDER_REPLACEMENTS: [RegExp, string][] = [
  [/Champions\s+Funding(?:\s+LLC)?/gi, "program guidelines"],
  [/ChampsTPO\.com/gi, "wholesale portal"],
  [/clientcare@champstpo\.com/gi, "support@vestednest.com"],
  [/Hometown\s+Equity\s+Mortgage(?:,\s*LLC)?/gi, "rate sheet provider"],
  [/dba\s+theLender/gi, "rate sheet provider"],
  [/theLender/gi, "rate sheet provider"],
  [/thelender\.com/gi, "pricing portal"],
  [/pricingdesk@thelender\.com/gi, "pricing desk"],
  [/NMLS\s*#?\s*2254210/gi, "NMLS #XXXXXXX"],
  [/NMLS\s*#?\s*133519/gi, "NMLS #XXXXXXX"],
  [/365\s+E\.\s*Germann\s+Road[^|]*/gi, "[address redacted]"],
  [/25531\s+Commercentre\s+Dr[^|]*/gi, "[address redacted]"],
  [/\(888\)\s*210-9881/g, "[phone redacted]"],
  [/833-381-8733/g, "[phone redacted]"],
  [/theNONI/gi, "DSCR program"],
  [/theNearNONI/gi, "near-DSCR program"],
  [/theSuperNONI/gi, "super-DSCR program"],
  [/NONI58/gi, "DSCR program"],
  [/theITIN/gi, "ITIN program"],
  [/Activator\s+Prime/gi, "consumer alt-doc program"],
  [/Accelerator/gi, "business-purpose program"],
  [/Ambassador/gi, "foreign national program"],
  [/Ally\s*\|/gi, "no-ratio program |"],
];

const PII_PATTERNS: [RegExp, string][] = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email redacted]"],
  [/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[phone redacted]"],
  [/\b\d{3}-\d{2}-\d{4}\b/g, "[ssn redacted]"],
];

export type SanitizeOptions = {
  extraReplacements?: [RegExp, string][];
  stripPii?: boolean;
};

export function sanitizeContent(
  text: string,
  options: SanitizeOptions = {},
): string {
  let result = text;
  const replacements = [
    ...LENDER_REPLACEMENTS,
    ...(options.extraReplacements ?? []),
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  if (options.stripPii !== false) {
    for (const [pattern, replacement] of PII_PATTERNS) {
      result = result.replace(pattern, replacement);
    }
  }

  return result.replace(/\s{2,}/g, " ").trim();
}

export function sanitizeTitle(title: string): string {
  return sanitizeContent(title, { stripPii: false });
}

/** Returns true if text still contains known confidential lender markers. */
export function hasConfidentialMarkers(text: string): boolean {
  const markers = [
    /champions\s+funding/i,
    /thelender/i,
    /champstpo/i,
    /hometown\s+equity/i,
    /pricingdesk@/i,
  ];
  return markers.some((m) => m.test(text));
}
