/** Next-step chip labels aligned with FLOW_STEPS in flow-chrome.tsx */
export const FLOW_NEXT_STEP_CHIPS = {
  reportMetadata: "Continue to report metadata",
  propertyIntel: "View property intelligence",
  loanStructure: "Structure loan",
  termSheet: "Open term sheet",
  preQual: "Start pre-qualification",
  closeTracker: "View close tracker",
  /** Primary CTA from chat after property is loaded */
  openTermSheet: "Yes — open term sheet",
} as const;

/** Map chip label (lowercase) to flow screen index */
export const FLOW_CHIP_TO_SCREEN: Record<string, number> = {
  [FLOW_NEXT_STEP_CHIPS.openTermSheet.toLowerCase()]: 2,
  [FLOW_NEXT_STEP_CHIPS.reportMetadata.toLowerCase()]: 2,
  "view results →": 3,
  [FLOW_NEXT_STEP_CHIPS.propertyIntel.toLowerCase()]: 3,
  [FLOW_NEXT_STEP_CHIPS.loanStructure.toLowerCase()]: 4,
  "structure loan →": 4,
  [FLOW_NEXT_STEP_CHIPS.termSheet.toLowerCase()]: 5,
  [FLOW_NEXT_STEP_CHIPS.preQual.toLowerCase()]: 6,
  [FLOW_NEXT_STEP_CHIPS.closeTracker.toLowerCase()]: 7,
};

export function screenForFlowChip(label: string): number | null {
  const key = label.trim().toLowerCase();
  if (FLOW_CHIP_TO_SCREEN[key] != null) return FLOW_CHIP_TO_SCREEN[key];
  return null;
}

/** Prefer next-step chip first; cap at maxActions. */
export function withNextStepChip(
  actions: string[],
  nextStep: string,
  maxActions = 4,
): string[] {
  const next = nextStep.trim();
  if (!next) return actions.slice(0, maxActions);

  const lower = next.toLowerCase();
  const rest = actions.filter((a) => a.trim().toLowerCase() !== lower);
  const merged = [next, ...rest];
  return merged.slice(0, maxActions);
}
