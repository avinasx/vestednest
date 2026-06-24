type ScoreBlock = { score?: number | string; no_score_reason?: string[] };

/** Pick best available FICO from iSoftpull full_feed credit_score object */
export function extractFicoFromCreditScore(
  creditScore?: Record<string, ScoreBlock>,
): number | null {
  if (!creditScore) return null;

  const priority = ["fico_8", "fico_4", "fico_2", "vantage_4", "vantage_3"];
  for (const key of priority) {
    const block = creditScore[key];
    if (!block) continue;
    const s = block.score;
    if (typeof s === "number" && s >= 300 && s <= 850) return Math.round(s);
    if (typeof s === "string" && /^\d{3}$/.test(s)) return Number(s);
  }

  for (const block of Object.values(creditScore)) {
    const s = block.score;
    if (typeof s === "number" && s >= 300 && s <= 850) return Math.round(s);
  }

  return null;
}
