import { parseUsAddress } from "@/lib/address";
import { looksLikeGibberish } from "@/lib/address-resolve";
import { FLOW_NEXT_STEP_CHIPS, withNextStepChip } from "@/lib/flow-step-chips";

export type ChatHistoryItem = { role: "user" | "assistant"; content: string };

const QUESTION_PREFIX =
  /^(what|how|why|when|where|who|can|do|does|did|is|are|will|would|should|could|tell me|explain)\b/i;

/** True when the message is clearly a question or FAQ — not an address lookup. */
export function isConversationalQuery(message: string): boolean {
  const t = message.trim();
  if (!t) return false;
  if (t.endsWith("?")) return true;
  if (QUESTION_PREFIX.test(t)) return true;
  if (/\b(what if|how does|how do|tell me about|explain)\b/i.test(t)) return true;
  return false;
}

/** Stricter than legacy mightBeAddressQuery — avoids firing parcel search on chat phrases. */
export function isLikelyAddressQuery(message: string): boolean {
  const t = message.trim();
  if (t.length < 4) return false;
  if (isConversationalQuery(t)) return false;

  const ml = t.toLowerCase();
  if (
    /\b(adjust|download|refi|bridge|quote|dscr|rate|term sheet|pre-qual|prequal|w2|foreign|eligible|help)\b/i.test(
      ml,
    ) &&
    !/\d{1,5}\s+\w/.test(t)
  ) {
    return false;
  }

  if (looksLikeGibberish(t)) return false;

  const parsed = parseUsAddress(t);
  if (parsed?.streetAddress && /^\d+/.test(parsed.streetAddress)) {
    return true;
  }

  if (/\d{1,5}\s+[A-Za-z]/.test(t)) {
    const hasStreetCue =
      /\b(ave|avenue|dr|drive|rd|road|st|street|blvd|ln|lane|ct|court|way|pl|place|cir|circle|hwy|highway|pkwy|parkway)\b/i.test(
        t,
      ) || /\b[A-Za-z]+,?\s+[A-Z]{2}\b/.test(t);
    if (hasStreetCue || /\d{5}/.test(t)) return true;
  }

  return false;
}

/** @deprecated Use isLikelyAddressQuery — kept for gradual migration */
export function mightBeAddressQuery(message: string): boolean {
  return isLikelyAddressQuery(message);
}

function lastUserAddress(history: ChatHistoryItem[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.role === "user" && isLikelyAddressQuery(m.content)) {
      return m.content.trim();
    }
  }
  return null;
}

function hadPropertyLookup(history: ChatHistoryItem[]): boolean {
  return history.some(
    (m) =>
      m.role === "assistant" &&
      (/\bEstimated rent:/i.test(m.content) ||
        /\bpulled property data/i.test(m.content) ||
        /\bProperty found at/i.test(m.content)),
  );
}

export function suggestFollowUpActions(
  userMessage: string,
  history: ChatHistoryItem[] = [],
  opts?: { hasProperty?: boolean },
): string[] {
  const ml = userMessage.toLowerCase();
  const hasProperty = opts?.hasProperty ?? hadPropertyLookup(history);

  if (hasProperty) {
    if (ml.includes("adjust") || ml.includes("structure") || ml.includes("ltv")) {
      return withNextStepChip(
        ["Try 30% down instead", "Switch to interest-only", "Download PDF now"],
        FLOW_NEXT_STEP_CHIPS.openTermSheet,
      );
    }
    if (ml.includes("term sheet") || ml.includes("download pdf")) {
      return withNextStepChip(
        ["Adjust loan structure", "Download PDF now", "Structure loan"],
        FLOW_NEXT_STEP_CHIPS.propertyIntel,
      );
    }
    if (ml.includes("property intel") || ml.includes("parcel") || ml.includes("rent comp")) {
      return withNextStepChip(
        ["Adjust loan structure", "Download PDF now"],
        FLOW_NEXT_STEP_CHIPS.loanStructure,
      );
    }
    return withNextStepChip(
      ["Adjust loan structure", "Download PDF now"],
      FLOW_NEXT_STEP_CHIPS.openTermSheet,
    );
  }

  if (
    ml.includes("below 1") ||
    ml.includes("under 1") ||
    ml.includes("less than 1") ||
    ml.includes("low dscr")
  ) {
    return ["What is near-DSCR?", "How much down helps DSCR?", "Check a property address"];
  }

  if (ml.includes("dscr")) {
    return ["What if DSCR is below 1.0?", "How is DSCR calculated?", "Check a property address"];
  }

  if (ml.includes("bridge") || ml.includes("refi")) {
    return ["How fast can you close?", "Reuse bridge appraisal?", "Get a DSCR quote"];
  }

  if (ml.includes("foreign")) {
    return ["What docs do I need?", "Foreign national rates", "Get a DSCR quote"];
  }

  if (ml.includes("rate")) {
    return ["Get a DSCR quote", "Check my DSCR", "What states do you fund?"];
  }

  if (isLikelyAddressQuery(userMessage)) {
    return ["Try a different address", "Get a DSCR quote"];
  }

  const priorAddress = lastUserAddress(history);
  if (priorAddress && (ml.includes("quote") || ml.includes("check"))) {
    return ["Use my last address", "Enter a new address", "What if DSCR is below 1.0?"];
  }

  return ["Get a DSCR quote", "Refi out of bridge", "Check my DSCR"];
}

export function friendlyChatError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw.toLowerCase();

  if (msg.includes("rate limit") || msg.includes("429")) {
    return "I'm getting a lot of requests right now — give me a moment and try again.";
  }
  if (msg.includes("api key") || msg.includes("not configured")) {
    return "I'm having trouble connecting to my brain right now. You can still browse rates on the term sheet — or try again in a minute.";
  }
  if (msg.includes("quota") || msg.includes("resource exhausted")) {
    return "I'm at capacity for a moment. Try again shortly, or drop a property address and I'll pick up where we left off.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "That took longer than expected. Mind trying once more?";
  }
  if (msg.includes("not found") && msg.includes("address")) {
    return "I couldn't find that property in our records. Double-check the street number, city, and state — or try a nearby address.";
  }

  return "Something didn't go through on my end. Want to try that again, or ask me something else about DSCR?";
}
