import { NextResponse } from "next/server";
import { z } from "zod";
import { priceAt, solve, closingCosts, VN } from "@/lib/vn-engine";
import type { DealInput } from "@/lib/vn-engine";
import { checkRateLimit } from "@/lib/rate-limit";

const dealSchema = z.object({
  fico: z.number().min(620).max(850),
  value: z.number().positive(),
  down: z.number().min(0).max(80).optional(),
  rent: z.number().min(0),
  taxAnnual: z.number().min(0).optional(),
  insAnnual: z.number().min(0).optional(),
  hoaMonthly: z.number().min(0).optional(),
  purpose: z.enum(["purchase", "rt", "cashout"]).optional(),
  propertyType: z.enum(["sfr", "condo", "2to4", "coop"]).optional(),
  state: z.string().optional(),
  county: z.string().optional(),
  city: z.string().optional(),
  ppp: z.number().optional(),
  io: z.boolean().optional(),
  str: z.boolean().optional(),
  foreignNational: z.boolean().optional(),
  escrowWaiver: z.boolean().optional(),
  assets: z.number().optional(),
  cashOut: z.number().optional(),
  product: z.enum(["fx30", "arm76", "arm106"]).optional(),
  selectedRate: z.number().optional(),
  listRates: z.boolean().optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/price", 60);
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = dealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data as DealInput;

    if (parsed.data.listRates) {
      const base = solve(input);
      const ltv = base.ltv;
      const loan = base.loan;
      const ti = (input.taxAnnual || 0) / 12 + (input.insAnnual || 0) / 12;
      const qualRent = input.str ? input.rent * 0.8 : input.rent;

      const rates = Object.keys(VN.BASE)
        .map(Number)
        .sort((a, b) => a - b);

      const rows = [];
      for (const R of rates) {
        const pay =
          input.io
            ? (loan * R) / 100 / 12
            : (() => {
                const r = R / 100 / 12;
                const n = 360;
                return (loan * r) / (1 - Math.pow(1 + r, -n));
              })();
        const pitia = pay + ti;
        const dscr = pitia > 0 ? qualRent / pitia : 0;
        const p = priceAt(R, {
          ...input,
          ltv,
          loan,
          dscr,
          lane: base.lane === "decline" ? "theNONI" : base.lane,
        });
        if (!p) continue;
        const cc = closingCosts(
          { ...input, originationPct: 0 },
          { loan, rate: R, pointsPct: p.pointsPct, piti: pitia },
        );
        rows.push({
          rate: R,
          pointsPct: p.pointsPct,
          payment: Math.round(pitia),
          pi: Math.round(pay),
          dscr: +dscr.toFixed(2),
          cashToClose: cc.cashToClose,
          reserves: cc.reserves,
          fees: cc.fees,
          prepaids: cc.prepaids,
          pointsDollars: Math.round((loan * p.pointsPct) / 100),
        });
      }

      const parIdx = rows.findIndex((r) => r.pointsPct <= 0);
      const center = parIdx >= 0 ? parIdx : rows.length - 1;
      const ladder = rows.slice(Math.max(0, center - 3), center + 3);

      return NextResponse.json({ quote: base, ladder, parIndex: Math.min(3, center - Math.max(0, center - 3)) });
    }

    if (parsed.data.selectedRate != null) {
      const base = solve(input);
      const ti = (input.taxAnnual || 0) / 12 + (input.insAnnual || 0) / 12;
      const qualRent = input.str ? input.rent * 0.8 : input.rent;
      const R = parsed.data.selectedRate;
      const pay = input.io
        ? (base.loan * R) / 100 / 12
        : (() => {
            const r = R / 100 / 12;
            const n = 360;
            return (base.loan * r) / (1 - Math.pow(1 + r, -n));
          })();
      const pitia = pay + ti;
      const dscr = pitia > 0 ? qualRent / pitia : 0;
      const priced = priceAt(R, {
        ...input,
        ltv: base.ltv,
        loan: base.loan,
        dscr,
        lane: base.lane === "decline" ? "theNONI" : base.lane,
      });
      if (!priced) {
        return NextResponse.json({ error: "Rate not available for this deal" }, { status: 422 });
      }
      const cc = closingCosts(
        { ...input, originationPct: 0 },
        { loan: base.loan, rate: R, pointsPct: priced.pointsPct, piti: pitia },
      );
      return NextResponse.json({
        quote: {
          ...base,
          rate: R,
          pointsPct: priced.pointsPct,
          pay,
          piti: pitia,
          dscr: +dscr.toFixed(3),
          cashToClose: cc.cashToClose,
          reserves: cc.reserves,
          closing: cc,
          breakdown: priced.parts,
        },
      });
    }

    const quote = solve(input);
    return NextResponse.json({ quote });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pricing failed" },
      { status: 500 },
    );
  }
}
