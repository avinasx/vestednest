/**
 * VN — Vested Nest pricing engine
 * Source: theLender Non-QM Business Purpose Rate Sheet 06.18.2026 + matrix 05.15.2026
 */
import type {
  ClosingCostsResult,
  DealInput,
  InternalLane,
  PriceAtResult,
  QuoteResult,
} from "./types";

export type {
  ClosingCostsResult,
  DealInput,
  DealPurpose,
  InternalLane,
  PriceAtResult,
  ProductType,
  PropertyType,
  QuoteResult,
} from "./types";

const BASE: Record<number, [number, number, number]> = {
  5.75: [96.12, 96.02, 96.02],
  5.875: [97.12, 97.02, 97.02],
  6.0: [98.12, 98.02, 98.02],
  6.125: [99.12, 99.02, 99.02],
  6.25: [100.026, 99.926, 99.926],
  6.375: [100.776, 100.676, 100.676],
  6.5: [101.526, 101.426, 101.426],
  6.625: [102.151, 102.051, 102.051],
  6.75: [102.776, 102.676, 102.676],
  6.875: [103.151, 103.051, 103.051],
  7.0: [103.526, 103.426, 103.426],
  7.125: [103.901, 103.801, 103.801],
  7.25: [104.276, 104.176, 104.176],
  7.375: [104.651, 104.551, 104.551],
  7.5: [105.026, 104.926, 104.926],
  7.625: [105.401, 105.301, 105.301],
  7.75: [105.776, 105.676, 105.676],
  7.875: [106.151, 106.051, 106.051],
  8.0: [106.526, 106.426, 106.426],
  8.125: [106.901, 106.801, 106.801],
  8.25: [107.276, 107.176, 107.176],
  8.375: [107.651, 107.551, 107.551],
  8.5: [107.901, 107.801, 107.801],
  8.625: [108.151, 108.051, 108.051],
  8.75: [108.401, 108.301, 108.301],
  8.875: [108.651, 108.551, 108.551],
  9.0: [108.901, 108.801, 108.801],
  9.125: [109.151, 109.051, 109.051],
  9.25: [109.401, 109.301, 109.301],
};

const PROD = { fx30: 2, arm76: 0, arm106: 1 } as const;
const RATES = Object.keys(BASE)
  .map(Number)
  .sort((a, b) => a - b);

function bucket(ltv: number): number {
  if (ltv <= 50) return 0;
  if (ltv <= 55) return 1;
  if (ltv <= 60) return 2;
  if (ltv <= 65) return 3;
  if (ltv <= 70) return 4;
  if (ltv <= 75) return 5;
  if (ltv <= 80) return 6;
  if (ltv <= 85) return 7;
  return -1;
}

export const FICO_LLPA: Record<string, (number | null)[]> = {
  "760": [-0.125, -0.375, -0.625, -0.625, -0.75, -2.0, -2.5, -6.75],
  "740": [-0.25, -0.5, -0.75, -0.75, -1.0, -2.25, -2.75, -7.0],
  "720": [-0.5, -0.75, -1.0, -1.0, -1.25, -2.5, -3.625, -7.375],
  "700": [-0.875, -1.125, -1.125, -1.625, -2.0, -3.125, -4.375, -7.875],
  "680": [-1.75, -2.125, -1.875, -2.375, -2.75, -4.125, -6.5, null],
  "660": [-2.5, -2.875, -2.875, -3.375, -3.75, -5.875, -8.5, null],
  "640": [-4.25, -4.5, -4.5, -5.0, -5.5, null, null, null],
  "620": [-5.25, -5.5, -5.75, -6.5, null, null, null, null],
};

function ficoBand(f: number): string | null {
  if (f >= 760) return "760";
  if (f >= 740) return "740";
  if (f >= 720) return "720";
  if (f >= 700) return "700";
  if (f >= 680) return "680";
  if (f >= 660) return "660";
  if (f >= 640) return "640";
  if (f >= 620) return "620";
  return null;
}

export const DSCR_LLPA: Record<string, (number | null)[]> = {
  ge125: [0.625, 0.625, 0.625, 0.625, 0.625, 0.625, 0.625, 0.5],
  d100: [0, 0, 0, 0, 0, 0, 0, 0],
  d075: [-2.25, -2.25, -2.25, -2.25, -2.25, -3.25, null, null],
  lt075: [-5.875, -5.875, -5.875, -6.5, -6.875, -8.25, null, null],
  superNoni: [-0.75, -0.75, -0.75, -0.75, -1.0, -1.375, -2.125, null],
};

function dscrKey(d: number): string {
  if (d >= 1.25) return "ge125";
  if (d >= 1.0) return "d100";
  if (d >= 0.75) return "d075";
  return "lt075";
}

const ADD = {
  cashout_ge1: [-0.375, -0.375, -0.375, -0.5, -0.75, -1.5, null, null],
  cashout_lt1: [-0.75, -0.75, -0.75, -0.875, -1.25, null, null, null],
  condo: [-0.125, -0.125, -0.125, -0.25, -0.5, -0.75, -1.5, -3.5],
  units2to4: [-0.5, -0.5, -0.5, -0.5, -0.625, -0.75, -1.5, -4.0],
  io: [-0.5, -0.5, -0.5, -0.5, -0.625, -0.75, -1.0, -1.5],
  str: [-1.25, -1.25, -1.25, -1.25, -1.25, -1.625, -1.625, -1.625],
  escrowWaiver: [-0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, null],
  stateCINJNY: [0, 0, 0, 0, 0, -0.25, -0.5, -0.5],
  ppp: {
    60: [1.25, 1.25, 1.25, 1.25, 1.25, 1.0, 1.0, 1.0],
    48: [0.75, 0.75, 0.75, 0.75, 0.75, 0.625, 0.625, 0.625],
    36: [0.625, 0.625, 0.625, 0.625, 0.625, 0.5, 0.5, 0.5],
    24: [0.125, 0.125, 0.125, 0.125, 0.125, 0.0, 0.0, 0.0],
    12: [-0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5],
    0: [-1.5, -1.5, -1.5, -1.5, -1.75, -1.75, -1.75, -1.75],
  } as Record<number, (number | null)[]>,
};

function loanBal(amt: number, b: number): number {
  if (amt <= 150_000) return [-0.75, -0.75, -0.875, -0.875, -0.875, -1.75, -2.0, -4.0][b];
  if (amt <= 250_000) return [-0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.5, -0.5][b];
  if (amt <= 1_000_000) return 0;
  if (amt <= 1_500_000) return [0, 0, 0, 0, 0, 0, -0.5, null as unknown as number][b];
  if (amt <= 2_000_000) return [-0.25, -0.25, -0.25, -0.25, -0.25, -0.5, null as unknown as number, null as unknown as number][b];
  if (amt <= 2_500_000) return [-0.875, -0.875, -1.0, -1.25, -1.5, null as unknown as number, null as unknown as number, null as unknown as number][b];
  if (amt <= 3_000_000) return [-1.25, -1.25, -1.25, -1.625, -1.75, null as unknown as number, null as unknown as number, null as unknown as number][b];
  return [-2.0, -2.0, -2.0, -2.0, -2.5, null as unknown as number, null as unknown as number, null as unknown as number][b];
}

const PPP_CAP: Record<number, number> = { 60: 102, 48: 102, 36: 102, 24: 101.5, 12: 101, 0: 100 };

function maxPrice(ppp: number, dscr: number, loan: number, ltv: number): number {
  const c = [PPP_CAP[ppp] ?? 102];
  if (dscr < 0.75) c.push(99);
  if (loan > 2_500_000) c.push(100.5);
  if (ltv > 80) c.push(101);
  return Math.min(...c);
}

function june(
  purpose: string,
  ppp: number,
  dscr: number,
  loan: number,
  fn: boolean,
): number {
  if (dscr < 0.75 || fn || loan > 1_250_000) return 0;
  if (purpose === "purchase" && ppp === 60) return 0.75;
  if (purpose === "purchase" && ppp === 36) return 0.5;
  if (purpose === "cashout" && ppp === 60) return 0.5;
  if (purpose === "cashout" && ppp === 36) return 0.25;
  return 0;
}

const LOCK: Record<number, number> = { 15: 0, 30: 0, 45: -0.375 };

export const NONI: Record<number, [number, number, number, number][]> = {
  740: [[1e6, 85, 80, 75], [1.5e6, 80, 80, 75], [2e6, 75, 75, 70], [3.5e6, 70, 70, 65]],
  700: [[1e6, 85, 80, 75], [1.5e6, 80, 80, 75], [2e6, 75, 75, 70], [3.5e6, 70, 70, 65]],
  680: [[1e6, 80, 75, 70], [1.5e6, 75, 75, 70], [2e6, 70, 70, 65], [2.5e6, 70, 65, 65], [3e6, 65, 65, null as unknown as number]],
  660: [[1e6, 80, 75, 70], [1.5e6, 75, 75, 70], [2.5e6, 70, 65, 65], [3e6, 65, 65, null as unknown as number]],
  640: [[1e6, 70, 70, 60], [2e6, 65, 65, null as unknown as number], [3e6, 60, 60, null as unknown as number]],
  620: [[1e6, 65, 65, 55], [1.5e6, 60, 60, null as unknown as number], [2e6, 55, 55, null as unknown as number]],
};

export const NEAR: Record<number, [number, number, number, number][]> = {
  700: [[1.5e6, 75, 75, 70], [2e6, 70, 70, 65], [3e6, 70, 70, null as unknown as number]],
  680: [[1.5e6, 70, 70, 65], [2e6, 65, 65, 60], [3e6, 60, 60, null as unknown as number]],
  660: [[1e6, 65, 65, null as unknown as number]],
};

function matrixMaxLtv(
  matrix: Record<number, [number, number, number, number][]>,
  fico: number,
  loan: number,
  pIdx: number,
): number | null {
  const bands = Object.keys(matrix)
    .map(Number)
    .sort((a, b) => b - a);
  const band = bands.find((b) => fico >= b);
  if (!band) return null;
  const row = matrix[band].find((r) => loan <= r[0]);
  if (!row) return null;
  return row[1 + pIdx];
}

const PI = (loan: number, rate: number, yrs: number) => {
  const r = rate / 100 / 12;
  const n = yrs * 12;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
};

const IO = (loan: number, rate: number) => (loan * rate) / 100 / 12;

export function priceAt(rate: number, s: DealInput): PriceAtResult | null {
  const b = bucket(s.ltv ?? 0);
  if (b < 0) return null;
  const band = ficoBand(s.fico);
  if (!band) return null;
  const fc = FICO_LLPA[band][b];
  if (fc == null) return null;
  if (!(rate in BASE)) return null;

  const parts: { name: string; value: number }[] = [
    { name: "Base price", value: BASE[rate][PROD[s.product ?? "fx30"]] },
    { name: `FICO ${band}+ / CLTV`, value: fc },
  ];

  const dk = s.lane === "superNoni" ? "superNoni" : dscrKey(s.dscr ?? 0);
  const da = DSCR_LLPA[dk][b];
  if (da == null) return null;
  parts.push({
    name: `DSCR ${dk === "superNoni" ? "Asset-qualified" : dk.replace("d", "")}`,
    value: da,
  });

  const lb = loanBal(s.loan ?? 0, b);
  if (lb) parts.push({ name: "Loan balance", value: lb });

  if (s.purpose === "cashout") {
    const k = (s.dscr ?? 0) >= 1 ? ADD.cashout_ge1 : ADD.cashout_lt1;
    const v = k[b];
    if (v == null) return null;
    parts.push({ name: "Cash-out", value: v });
  }
  if (s.propertyType === "condo") {
    const v = ADD.condo[b];
    if (v == null) return null;
    parts.push({ name: "Condo", value: v });
  }
  if (s.propertyType === "2to4") {
    const v = ADD.units2to4[b];
    if (v == null) return null;
    parts.push({ name: "2–4 unit", value: v });
  }
  if (s.io) {
    const v = ADD.io[b];
    if (v == null) return null;
    parts.push({ name: "Interest only", value: v });
  }
  if (s.str) {
    const v = ADD.str[b];
    if (v != null) parts.push({ name: "Short-term rental", value: v });
  }
  if (s.escrowWaiver) {
    const v = ADD.escrowWaiver[b];
    if (v != null) parts.push({ name: "Escrow waiver", value: v });
  }
  if (["CT", "IL", "NJ", "NY"].includes(s.state ?? "")) {
    const v = ADD.stateCINJNY[b];
    if (v) parts.push({ name: `State ${s.state}`, value: v });
  }

  const ppp = s.ppp ?? 36;
  const pv = ADD.ppp[ppp] ? ADD.ppp[ppp][b] : 0;
  if (pv) parts.push({ name: `Prepay ${ppp ? `${ppp}mo` : "none"}`, value: pv });

  const js = june(s.purpose ?? "purchase", ppp, s.dscr ?? 0, s.loan ?? 0, !!s.foreignNational);
  if (js) parts.push({ name: "June special", value: js });

  const la = LOCK[s.lock ?? 30];
  if (la) parts.push({ name: `${s.lock ?? 30}-day lock`, value: la });

  const raw = parts.reduce((a, p) => a + p.value, 0);
  const cap = maxPrice(ppp, s.dscr ?? 0, s.loan ?? 0, s.ltv ?? 0);
  const net = Math.min(raw, cap);

  return {
    rate,
    parts,
    raw: +raw.toFixed(3),
    cap,
    net: +net.toFixed(3),
    capped: net < raw,
    pointsPct: +(100 - net).toFixed(3),
  };
}

export function bestEx(s: DealInput): PriceAtResult | null {
  let par: PriceAtResult | null = null;
  let fb: PriceAtResult | null = null;
  let fbn = -1e9;
  for (const r of RATES) {
    const p = priceAt(r, s);
    if (!p) continue;
    if (p.net > fbn) {
      fbn = p.net;
      fb = p;
    }
    if (p.net >= 100 && !par) par = p;
  }
  return par || fb;
}

export function nyMortgageTaxRate(county?: string, city?: string): number {
  const c = (county ?? "").toLowerCase();
  const t = (city ?? "").toLowerCase();
  if (t === "yonkers") return 0.018;
  if (["new york", "kings", "queens", "bronx", "richmond"].includes(c)) return 0.01925;
  if (["westchester"].includes(c)) return 0.013;
  if (["nassau", "suffolk", "rockland"].includes(c)) return 0.0105;
  return 0.005;
}

const ATTORNEY_CLOSE = ["NY", "GA", "SC", "NC", "MA", "CT", "DE", "VT", "WV", "AL"];

export function closingCosts(
  inp: DealInput,
  q: { loan: number; rate?: number; pointsPct?: number; piti?: number },
): ClosingCostsResult {
  const loan = q.loan;
  const value = inp.value;
  const st = (inp.state ?? "").toUpperCase();
  const isCoop = inp.propertyType === "coop";
  const fees: { name: string; value: number }[] = [];
  const add = (n: string, v: number) => {
    if (Math.round(v) !== 0) fees.push({ name: n, value: Math.round(v) });
  };

  add(`Origination (${inp.originationPct ?? 1}%)`, loan * ((inp.originationPct ?? 1) / 100));
  const pts = loan * ((q.pointsPct || 0) / 100);
  if (pts > 0) add("Discount points", pts);
  else if (pts < 0) add("Lender credit", pts);
  add("Underwriting fee", 2095);
  add("Doc prep fee", 599);
  add(
    `Appraisal${inp.propertyType === "2to4" ? " (1025+1007)" : " (1004+1007)"}`,
    inp.propertyType === "2to4" ? 950 : 675,
  );
  add("Credit + flood cert", 95);
  if (inp.purpose === "purchase") add("Owner's title policy", value * 0.004);
  else add("Lender's title policy", loan * 0.005);
  add("Settlement / closing", 750);
  add("Recording", 250);
  if (st === "NY" && !isCoop)
    add("NY mortgage recording tax", loan * nyMortgageTaxRate(inp.county, inp.city));
  if (ATTORNEY_CLOSE.includes(st)) add("Attorney", 2000);
  if (inp.purpose === "purchase" && st === "NY" && value >= 1_000_000)
    add("NY mansion tax (1%+)", value * 0.01);

  const feeTotal = fees.reduce((a, f) => a + f.value, 0);
  const prepaids: { name: string; value: number }[] = [];
  const padd = (n: string, v: number) => {
    if (Math.round(v) > 0) prepaids.push({ name: n, value: Math.round(v) });
  };
  if (!inp.escrowWaiver) {
    padd("Prepaid hazard insurance (12mo)", inp.insAnnual || 0);
    padd("Tax escrow (3mo)", ((inp.taxAnnual || 0) / 12) * (inp.escrowMonths ?? 3));
  }
  padd(
    `Per-diem interest (~${inp.daysToMonthEnd ?? 15}d)`,
    loan * ((q.rate || 0) / 100) / 360 * (inp.daysToMonthEnd ?? 15),
  );
  const prepaidTotal = prepaids.reduce((a, f) => a + f.value, 0);
  const down = inp.purpose === "purchase" ? value - loan : 0;
  const cashOut = inp.purpose === "cashout" ? inp.cashOut || 0 : 0;
  const reserves = Math.round((q.piti || 0) * (inp.reserveMonths ?? 6));
  const cashToClose = Math.max(0, down + feeTotal + prepaidTotal - cashOut);

  return {
    fees,
    feeTotal,
    prepaids,
    prepaidTotal,
    down,
    cashOut,
    reserves,
    cashToClose,
    isCoop,
    coopWarning: isCoop
      ? "Co-op share loans are generally NOT DSCR-eligible (no recorded lien on real property)"
      : null,
  };
}

export function solve(inp: DealInput): QuoteResult {
  const term = inp.term40 ? 40 : 30;
  const ltv = 100 - (inp.down ?? 25);
  const loan = Math.round((inp.value * ltv) / 100);
  const b = bucket(ltv);
  const qualRent = inp.str ? inp.rent * 0.8 : inp.rent;
  const ti =
    (inp.taxAnnual || 0) / 12 + (inp.insAnnual || 0) / 12 + (inp.hoaMonthly || 0);
  const pIdx = inp.purpose === "purchase" ? 0 : inp.purpose === "rt" ? 1 : 2;

  let rate = 7.5;
  let be: PriceAtResult | null = null;
  let dscr = 0;
  let pitia = 0;
  let pay = 0;
  let lane: InternalLane = "theNONI";

  for (let i = 0; i < 6; i++) {
    pay = inp.io ? IO(loan, rate) : PI(loan, rate, term);
    pitia = pay + ti;
    dscr = pitia > 0 ? qualRent / pitia : 0;
    if (dscr >= 1.0) lane = "theNONI";
    else if (dscr >= 0.75) lane = "nearNONI";
    else lane = "decline";

    const sc: DealInput = { ...inp, ltv, loan, dscr, lane };
    const nbe = bestEx(sc);
    if (!nbe) {
      be = null;
      break;
    }
    be = nbe;
    if (Math.abs(nbe.rate - rate) < 0.13) {
      rate = nbe.rate;
      break;
    }
    rate = nbe.rate;
  }

  const assets = inp.assets || 0;
  const superFinal = pitia > 0 ? (qualRent + assets / 60) / pitia : 0;
  const superEligible =
    !inp.str &&
    inp.fico >= 680 &&
    loan <= 2_000_000 &&
    dscr >= 0.75 &&
    dscr < 1.0 &&
    superFinal >= 1.15;

  let maxLtv: number | null = null;
  let eligible = false;
  let reason = "";
  let laneFinal: InternalLane = lane;
  let dscrForPrice = dscr;

  if (lane === "theNONI") {
    maxLtv = matrixMaxLtv(NONI, inp.fico, loan, pIdx);
    eligible = maxLtv != null && ltv <= maxLtv && b >= 0;
    if (!eligible)
      reason =
        maxLtv == null
          ? "No Standard DSCR program at this FICO/loan size"
          : `Lower leverage — Standard DSCR max is ${maxLtv}% LTV here`;
  } else if (lane === "nearNONI") {
    const nearMax = matrixMaxLtv(NEAR, inp.fico, loan, pIdx);
    const nearOk = nearMax != null && ltv <= nearMax && inp.fico >= 680;
    if (nearOk) {
      laneFinal = "nearNONI";
      maxLtv = nearMax;
      eligible = true;
    } else if (superEligible) {
      laneFinal = "superNoni";
      maxLtv = matrixMaxLtv(NONI, inp.fico, loan, pIdx);
      eligible = maxLtv != null && ltv <= maxLtv;
      dscrForPrice = superFinal;
    } else {
      laneFinal = superEligible ? "superNoni" : "nearNONI";
      maxLtv = nearMax;
      eligible = false;
      reason =
        inp.fico < 680
          ? "Low DSCR needs FICO ≥ 680 (660 experienced)"
          : nearMax == null
            ? "Outside the Low DSCR loan/LTV grid"
            : assets > 0
              ? "Add assets or lower LTV — Asset-qualified needs final DSCR ≥ 1.15"
              : "DSCR under 1.00 — add reserves/assets for Asset-qualified, or lower leverage";
    }
  } else {
    if (superEligible) {
      laneFinal = "superNoni";
      maxLtv = matrixMaxLtv(NONI, inp.fico, loan, pIdx);
      eligible = maxLtv != null && ltv <= maxLtv;
      dscrForPrice = superFinal;
    } else {
      laneFinal = "decline";
      eligible = false;
      reason =
        "DSCR below 0.75 — outside the DSCR programs. Route to an income-qualified path.";
    }
  }

  if (laneFinal === "superNoni") {
    const sc: DealInput = { ...inp, ltv, loan, dscr: dscrForPrice, lane: "superNoni" };
    const sbe = bestEx(sc);
    if (sbe) {
      be = sbe;
      rate = sbe.rate;
      pay = inp.io ? IO(loan, rate) : PI(loan, rate, term);
      pitia = pay + ti;
    }
  }

  const q = { loan, rate: be ? be.rate : 0, pointsPct: be ? be.pointsPct : 0, piti: pitia };
  const cc = closingCosts(inp, q);
  const points = be ? (loan * be.pointsPct) / 100 : 0;
  const cashflow = inp.rent - pitia;
  const coc = cc.cashToClose > 0 ? (cashflow * 12) / cc.cashToClose * 100 : 0;

  const laneLabel: Record<InternalLane, string> = {
    theNONI: "Standard DSCR · 1.0+",
    nearNONI: "Low DSCR · 0.75–0.99",
    superNoni: "Asset-qualified",
    decline: "Below program · income-qualified",
  };

  return {
    ltv,
    loan,
    lane: laneFinal,
    laneLabel: laneLabel[laneFinal],
    eligible,
    reason,
    rate: be ? be.rate : null,
    price: be ? be.net : null,
    pointsPct: be ? be.pointsPct : null,
    capped: be ? be.capped : false,
    breakdown: be ? be.parts : [],
    pay,
    ti,
    piti: pitia,
    dscr: +dscr.toFixed(3),
    superFinal: +superFinal.toFixed(3),
    superEligible,
    maxLtv,
    downAmt: cc.down,
    points,
    fees: cc.feeTotal,
    cashToClose: cc.cashToClose,
    reserves: cc.reserves,
    closing: cc,
    cashflow,
    coc: +coc.toFixed(1),
  };
}

export const VN = { solve, priceAt, bestEx, closingCosts, nyMortgageTaxRate, BASE, FICO_LLPA, DSCR_LLPA, NONI, NEAR };
