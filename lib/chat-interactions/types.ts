/** Outcome of a chat-integrated API call — extensible across integrations. */
export type InteractionStatus =
  | "success"
  | "needs_selection"
  | "not_found"
  | "invalid_input"
  | "blocked"
  | "error";

/** User-selectable option when input is ambiguous. */
export type SelectableOption = {
  id: string;
  label: string;
  subtitle?: string;
  meta?: Record<string, unknown>;
};

/**
 * Structured result from any chat tool or API integration.
 * `source` is internal only — never shown to end users.
 */
export type ChatInteraction = {
  status: InteractionStatus;
  kind: string;
  message: string;
  options?: SelectableOption[];
  data?: unknown;
  source?: string;
};

export type AddressInteractionData = {
  intel: import("@/lib/property-intel").PropertyIntel;
  formattedAddress: string;
  termSheet: import("@/lib/dscr").TermSheet;
};

export type EligibilityInteractionData = {
  state: string;
  eligible: boolean;
  requiresAttestation?: boolean;
  requiresLlc?: boolean;
};
