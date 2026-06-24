import { describe, expect, it } from "vitest";
import { solve } from "./index";

/** Albertson NY reference deal — Build Bible §8.5 */
const ALBERTSON = {
  fico: 752,
  value: 818_480,
  rent: 9_440,
  taxAnnual: 15_699,
  insAnnual: 2_400,
  purpose: "purchase" as const,
  propertyType: "sfr" as const,
  state: "NY",
  county: "Nassau",
  ppp: 36,
  io: false,
  str: false,
  foreignNational: false,
  originationPct: 0,
};

describe("VN engine — Albertson golden file", () => {
  it("25% down matches Build Bible rate/DSCR/PITIA", () => {
    const q = solve({ ...ALBERTSON, down: 25 });
    expect(q.eligible).toBe(true);
    expect(q.lane).toBe("theNONI");
    expect(q.ltv).toBe(75);
    expect(q.rate).toBeCloseTo(6.5, 2);
    expect(q.dscr).toBeCloseTo(1.75, 2);
    expect(Math.round(q.piti)).toBe(5388);
    expect(Math.round(q.cashflow)).toBe(4052);
    expect(q.reserves).toBe(32_330);
    expect(q.cashToClose).toBe(225_410);
    expect(q.coc).toBeCloseTo(21.6, 1);
  });

  it("20% down matches Build Bible rate/DSCR/PITIA", () => {
    const q = solve({ ...ALBERTSON, down: 20 });
    expect(q.eligible).toBe(true);
    expect(q.rate).toBeCloseTo(6.625, 2);
    expect(q.dscr).toBeCloseTo(1.66, 2);
    expect(Math.round(q.piti)).toBe(5701);
    expect(Math.round(q.cashflow)).toBe(3739);
  });

  it("40% down matches Build Bible rate/DSCR/cash flow", () => {
    const q = solve({ ...ALBERTSON, down: 40 });
    expect(q.eligible).toBe(true);
    expect(q.rate).toBeCloseTo(6.125, 2);
    expect(q.dscr).toBeCloseTo(2.1, 2);
    expect(Math.round(q.cashflow)).toBe(4948);
    expect(q.coc).toBeCloseTo(16.8, 0);
  });
});
