import { buildPropertySearchParams, parseUsAddress } from "@/lib/address";
import { isLikelyAddressQuery } from "@/lib/chat-intent";
import {
  lookupProperty,
  scorePropertyMatch,
  searchAddressSuggestions,
  searchNearbyProperties,
  type AddressSuggestion,
} from "@/lib/realie";

export type PublicAddressSuggestion = {
  id: string;
  label: string;
  streetAddress: string;
  city: string | null;
  state: string;
  zip: string | null;
};

export type AddressResolveResult =
  | {
      status: "found";
      property: Record<string, unknown>;
      nearby: Record<string, unknown>[];
    }
  | {
      status: "suggestions";
      suggestions: PublicAddressSuggestion[];
      message: string;
    }
  | { status: "not_found"; message: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export function toPublicSuggestion(s: AddressSuggestion): PublicAddressSuggestion {
  const { property: _p, ...rest } = s;
  return rest;
}

export function mapRealieError(error: string | null, httpStatus?: number): string {
  const err = (error ?? "").toLowerCase();
  if (
    httpStatus === 429 ||
    err.includes("rate limit") ||
    err.includes("too many")
  ) {
    return "Property lookup is temporarily unavailable. Try again in a moment.";
  }
  if (
    httpStatus === 502 ||
    httpStatus === 503 ||
    httpStatus === 504 ||
    err.includes("502") ||
    err.includes("503") ||
    err.includes("unavailable")
  ) {
    return "Property lookup is temporarily unavailable. Try again in a moment.";
  }
  if (httpStatus === 404 || err.includes("not found")) {
    return "We couldn't find a property at that address. Try adding city and state, or pick from the suggestions below.";
  }
  return "We couldn't find a property at that address. Try adding city and state, or pick from the suggestions below.";
}

/** Heuristic for nonsense input before hitting Realie. */
export function looksLikeGibberish(query: string): boolean {
  const t = query.trim();
  if (t.length < 3) return true;
  if (/\b99999\b/.test(t)) return true;
  if (/^asdf|qwerty|zxcv/i.test(t.replace(/\s/g, ""))) return true;
  const letters = (t.match(/[a-z]/gi) ?? []).length;
  const digits = (t.match(/\d/g) ?? []).length;
  if (letters < 2 && digits === 0) return true;
  const hasStreetCue =
    /\d{1,5}\s+\w/.test(t) ||
    /\b(ave|avenue|dr|drive|rd|road|st|street|blvd|ln|lane|ct|court|way|pl|place|cir|circle)\b/i.test(
      t,
    );
  if (!hasStreetCue && digits === 0 && t.length < 12) return true;
  return false;
}

export function extractStateFromQuery(query: string, fallback: string): string {
  const parsed = parseUsAddress(query);
  if (parsed?.state) return parsed.state;
  const tail = query.trim().match(/\b([A-Za-z]{2})\s*(\d{5})?\s*$/);
  if (tail) return tail[1].toUpperCase();
  return fallback.toUpperCase();
}

function isCompleteAddress(parsed: ReturnType<typeof parseUsAddress>): boolean {
  if (!parsed) return false;
  const hasNumber = /^\d+/.test(parsed.streetAddress);
  return Boolean(hasNumber && parsed.city && parsed.state);
}

export async function resolveAddressInput(
  address: string,
  defaultState = "GA",
): Promise<AddressResolveResult> {
  const trimmed = address.trim();
  if (trimmed.length < 2) {
    return {
      status: "invalid",
      message: "That doesn't look like a valid US address yet.",
    };
  }

  if (looksLikeGibberish(trimmed)) {
    return {
      status: "invalid",
      message:
        "We couldn't find an address matching that. Try adding city and state, or pick from the suggestions below.",
    };
  }

  const state = extractStateFromQuery(trimmed, defaultState);
  const parsed = parseUsAddress(trimmed);
  const complete = isCompleteAddress(parsed);

  if (parsed) {
    const direct = await lookupProperty(parsed);
    if (direct.property) {
      const nearby = await searchNearbyProperties(direct.property, 4);
      return { status: "found", property: direct.property, nearby };
    }
    if (
      direct.error &&
      direct.error !== "Property not found for this address" &&
      !direct.error.toLowerCase().includes("not found")
    ) {
      return {
        status: "error",
        message: mapRealieError(direct.error),
      };
    }
  }

  const search = await searchAddressSuggestions(trimmed, state, 8);
  if (search.error) {
    return {
      status: "error",
      message: mapRealieError(search.error),
    };
  }

  if (search.suggestions.length === 0) {
    return {
      status: "not_found",
      message:
        "We couldn't find a property at that address. Try adding city and state, or pick from the suggestions below.",
    };
  }

  const criteria = buildPropertySearchParams(trimmed, state);
  const scored = search.suggestions.map((s) => ({
    suggestion: s,
    score: scorePropertyMatch(s.property, {
      streetAddress: criteria.address ?? trimmed,
      city: criteria.city ?? parsed?.city ?? null,
      zip: parsed?.zip ?? null,
      state,
    }),
  }));

  const MIN_MATCH_SCORE = 22;
  const viable = scored.filter((s) => s.score >= MIN_MATCH_SCORE);
  if (viable.length === 0 || viable[0].score < 30) {
    return {
      status: "not_found",
      message:
        "We couldn't find an address matching that. Try adding city and state, or pick from the suggestions below.",
    };
  }

  const best = viable[0];
  const second = viable[1];

  if (
    viable.length === 1 &&
    best.score >= 85 &&
    (complete || /^\d+/.test(best.suggestion.streetAddress))
  ) {
    const nearby = await searchNearbyProperties(best.suggestion.property, 4);
    return {
      status: "found",
      property: best.suggestion.property,
      nearby,
    };
  }

  if (
    complete &&
    viable.length === 1 &&
    best.score >= 70 &&
    (!second || best.score - second.score >= 25)
  ) {
    const nearby = await searchNearbyProperties(best.suggestion.property, 4);
    return {
      status: "found",
      property: best.suggestion.property,
      nearby,
    };
  }

  const suggestions = viable.map((v) => toPublicSuggestion(v.suggestion));
  const message =
    suggestions.length === 1
      ? "Do you mean this property?"
      : "Do you mean one of these?";

  return { status: "suggestions", suggestions, message };
}

/** @deprecated Prefer isLikelyAddressQuery from @/lib/chat-intent */
export function mightBeAddressQuery(message: string): boolean {
  return isLikelyAddressQuery(message);
}
