import { resolveAddressInput } from "@/lib/address-resolve";
import { calculateTermSheetAsync } from "@/lib/dscr";
import { isStateEligible } from "@/lib/eligibility";
import {
  buildPropertyIntel,
  enrichPropertyIntel,
  formatAddress,
} from "@/lib/property-intel";
import { ADDRESS_NONE_OPTION_ID } from "./action-chips";
import type { InteractionHandler } from "./registry";
import type { AddressInteractionData, ChatInteraction, SelectableOption } from "./types";

export const ADDRESS_KIND = "address";

export type AddressResolveInput = {
  address: string;
  state?: string;
  /** Skip RentCast enrichment until user confirms (selection flow). */
  enrichRent?: boolean;
};

function suggestionsToOptions(
  suggestions: {
    id: string;
    label: string;
    streetAddress: string;
    city: string | null;
    state: string;
    zip: string | null;
  }[],
): SelectableOption[] {
  return suggestions.map((s) => ({
    id: s.id,
    label: s.label,
    subtitle: s.zip ?? (s.city ? `${s.city}, ${s.state}` : s.state),
    meta: {
      streetAddress: s.streetAddress,
      city: s.city,
      state: s.state,
      zip: s.zip,
      label: s.label,
    },
  }));
}

async function buildAddressSuccess(
  property: Record<string, unknown>,
  nearby: Record<string, unknown>[],
  enrichRent = true,
): Promise<ChatInteraction> {
  const baseIntel = buildPropertyIntel(property, nearby);
  const intel = enrichRent ? await enrichPropertyIntel(baseIntel) : baseIntel;
  const formattedAddress = formatAddress(intel);

  const stateCheck = intel.state ? await isStateEligible(intel.state) : null;
  if (stateCheck && !stateCheck.eligible) {
    return {
      status: "blocked",
      kind: ADDRESS_KIND,
      message: stateCheck.message,
      data: {
        formattedAddress,
        intel,
        state: intel.state,
      } satisfies Partial<AddressInteractionData> & { state?: string },
      source: "eligibility",
    };
  }

  const termSheet = await calculateTermSheetAsync({
    purchasePrice: intel.arv || intel.marketValue || 300000,
    downPaymentPct: 25,
    monthlyRent: intel.estimatedRent,
    annualTax: intel.annualTax ?? 3000,
    purpose: "purchase",
    term: "30yr",
    prepay: "3yr",
    interestOnly: false,
    state: intel.state,
  });

  const data: AddressInteractionData = { intel, formattedAddress, termSheet };

  return {
    status: "success",
    kind: ADDRESS_KIND,
    message: `Property found at ${formattedAddress}.`,
    data,
    source: "parcel_search",
  };
}

function mapResolveFailure(
  resolved: Extract<
    Awaited<ReturnType<typeof resolveAddressInput>>,
    { status: "not_found" | "error" | "invalid" }
  >,
): ChatInteraction {
  if (resolved.status === "invalid") {
    return {
      status: "invalid_input",
      kind: ADDRESS_KIND,
      message: resolved.message,
      source: "parcel_search",
    };
  }
  if (resolved.status === "error") {
    return {
      status: "error",
      kind: ADDRESS_KIND,
      message: resolved.message,
      source: "parcel_search",
    };
  }
  return {
    status: "not_found",
    kind: ADDRESS_KIND,
    message: resolved.message,
    source: "parcel_search",
  };
}

export const addressInteractionHandler: InteractionHandler = {
  kind: ADDRESS_KIND,

  async resolve(input, _context) {
    const { address, state, enrichRent = true } = input as AddressResolveInput;
    const resolved = await resolveAddressInput(address, state ?? "GA");

    if (resolved.status === "found") {
      return buildAddressSuccess(resolved.property, resolved.nearby, enrichRent);
    }

    if (resolved.status === "suggestions") {
      return {
        status: "needs_selection",
        kind: ADDRESS_KIND,
        message: resolved.message,
        options: suggestionsToOptions(resolved.suggestions),
        source: "parcel_search",
      };
    }

    return mapResolveFailure(resolved);
  },

  async resolveSelection(optionId, meta) {
    if (optionId === ADDRESS_NONE_OPTION_ID) {
      return {
        status: "invalid_input",
        kind: ADDRESS_KIND,
        message:
          "No problem — please retry with the full street address, city, and state.",
        source: "parcel_search",
      };
    }

    const label = typeof meta?.label === "string" ? meta.label : "";
    const state = typeof meta?.state === "string" ? meta.state : "GA";
    if (!label) {
      return {
        status: "error",
        kind: ADDRESS_KIND,
        message: "Could not load the selected address. Try again.",
        source: "parcel_search",
      };
    }
    return addressInteractionHandler.resolve({
      address: label,
      state,
      enrichRent: true,
    });
  },

  formatError(err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    if (msg.includes("rate limit") || msg.includes("502") || msg.includes("503")) {
      return "Property lookup is temporarily unavailable. Try again in a moment.";
    }
    return "We couldn't load property details right now. Try again in a moment.";
  },
};
