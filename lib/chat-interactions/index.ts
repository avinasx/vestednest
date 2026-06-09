import { addressInteractionHandler } from "./address";
import { eligibilityInteractionHandler } from "./eligibility";
import { rateQuoteInteractionHandler } from "./rate-quote";
import { registerInteractionHandler } from "./registry";

let registered = false;

/** Idempotent — safe to call from any server entry point. */
export function ensureInteractionHandlersRegistered(): void {
  if (registered) return;
  registerInteractionHandler(addressInteractionHandler);
  registerInteractionHandler(eligibilityInteractionHandler);
  registerInteractionHandler(rateQuoteInteractionHandler);
  registered = true;
}

ensureInteractionHandlersRegistered();

export * from "./types";
export * from "./registry";
export * from "./compat";
export { ADDRESS_KIND, type AddressResolveInput } from "./address";
export { ELIGIBILITY_KIND, type EligibilityResolveInput } from "./eligibility";
export { RATE_QUOTE_KIND, type RateQuoteResolveInput } from "./rate-quote";
