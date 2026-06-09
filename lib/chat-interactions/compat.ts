import type { PublicAddressSuggestion } from "@/lib/address-resolve";
import type { AddressInteractionData, ChatInteraction } from "./types";
import { ADDRESS_KIND } from "./address";

/** Backward-compat: map address interaction options to legacy addressSuggestions shape. */
export function interactionToAddressSuggestions(
  interaction: ChatInteraction | null | undefined,
): PublicAddressSuggestion[] | null {
  if (
    !interaction ||
    interaction.kind !== ADDRESS_KIND ||
    interaction.status !== "needs_selection" ||
    !interaction.options?.length
  ) {
    return null;
  }

  return interaction.options.map((o) => ({
    id: o.id,
    label: o.label,
    streetAddress:
      (typeof o.meta?.streetAddress === "string" && o.meta.streetAddress) ||
      o.label.split(",")[0]?.trim() ||
      o.label,
    city: typeof o.meta?.city === "string" ? o.meta.city : null,
    state: typeof o.meta?.state === "string" ? o.meta.state : "GA",
    zip: typeof o.meta?.zip === "string" ? o.meta.zip : null,
  }));
}

export function propertyFromInteraction(
  interaction: ChatInteraction | null | undefined,
): {
  intel: AddressInteractionData["intel"];
  formattedAddress: string;
  termSheet: AddressInteractionData["termSheet"];
} | null {
  if (
    !interaction ||
    interaction.kind !== ADDRESS_KIND ||
    interaction.status !== "success" ||
    !interaction.data
  ) {
    return null;
  }

  const data = interaction.data as AddressInteractionData;
  if (!data.intel || !data.formattedAddress || !data.termSheet) return null;

  return {
    intel: data.intel,
    formattedAddress: data.formattedAddress,
    termSheet: data.termSheet,
  };
}

/** Strip internal `source` before sending to clients. */
export function toClientInteraction(
  interaction: ChatInteraction | null | undefined,
): Omit<ChatInteraction, "source"> | null {
  if (!interaction) return null;
  const { source: _source, ...client } = interaction;
  return client;
}
