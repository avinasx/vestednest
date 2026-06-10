import type { ChatInteraction, SelectableOption } from "./types";

/** Max address matches shown as chips (plus "None"). */
export const MAX_SELECTION_CHIPS = 3;

export const ADDRESS_NONE_OPTION_ID = "address:none";
export const ADDRESS_NONE_LABEL = "None of these";

/** Chip labels for ambiguous address / interaction selection. */
export function selectionActionsFromInteraction(
  interaction: Pick<ChatInteraction, "status" | "options"> | null | undefined,
): string[] {
  if (interaction?.status !== "needs_selection" || !interaction.options?.length) {
    return [];
  }

  const labels = interaction.options.slice(0, MAX_SELECTION_CHIPS).map((o) => o.label);
  labels.push(ADDRESS_NONE_LABEL);
  return labels;
}

/** Map a tapped chip label back to the selectable option (or None). */
export function optionForSelectionAction(
  interaction: Pick<ChatInteraction, "options">,
  actionLabel: string,
): SelectableOption | null {
  if (actionLabel === ADDRESS_NONE_LABEL) {
    return { id: ADDRESS_NONE_OPTION_ID, label: ADDRESS_NONE_LABEL };
  }
  return interaction.options?.find((o) => o.label === actionLabel) ?? null;
}

/** Drop chip labels that are bot prompts, not user replies. */
export function filterUserFacingActions(actions: string[]): string[] {
  return actions.filter((a) => {
    const t = a.trim();
    if (!t) return false;
    if (/^(enter|input|type|provide|share|give me|tell me your|drop your)\b/i.test(t)) {
      return false;
    }
    return true;
  });
}
