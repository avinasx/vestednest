import { describe, expect, it } from "vitest";
import { extractFicoFromCreditScore } from "./extract-fico";

describe("extractFicoFromCreditScore", () => {
  it("prefers fico_8 over vantage", () => {
    const fico = extractFicoFromCreditScore({
      fico_8: { score: 752 },
      vantage_4: { score: 740 },
    });
    expect(fico).toBe(752);
  });

  it("returns null when no valid score", () => {
    expect(extractFicoFromCreditScore({ fico_8: { score: "NA" } })).toBeNull();
  });
});
