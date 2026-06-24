import { solve, type QuoteResult } from "@/lib/vn-engine";
import { dealToEngineInput } from "@/lib/deal/map-to-engine";
import type {
  BorrowerGoal,
  DealState,
  ProductChoice,
  ScenarioRow,
} from "@/lib/deal/types";

export type ObjectiveLeader = {
  objective: string;
  rowId: string;
  label: string;
};

export type ScenarioEngineResult = {
  rows: ScenarioRow[];
  eligibleRows: ScenarioRow[];
  leaders: ObjectiveLeader[];
  recommended: ScenarioRow | null;
  constraints: ConstraintLever[];
};

export type ConstraintLever = {
  lever: string;
  description: string;
  value?: string | number;
};

const DOWN_RUNGS = [20, 25, 30, 35, 40];
const PRODUCTS: { product: ProductChoice; io: boolean; label: string }[] = [
  { product: "fx30", io: false, label: "30-yr fixed" },
  { product: "arm76", io: false, label: "7/6 ARM" },
  { product: "io", io: true, label: "Interest-only" },
];

function rowId(down: number, product: ProductChoice): string {
  return `${down}-${product}`;
}

function buildRow(deal: DealState, down: number, product: ProductChoice, io: boolean): ScenarioRow {
  const input = dealToEngineInput(deal, { down, product: product === "io" ? "fx30" : product, io });
  const quote = solve(input);
  return {
    id: rowId(down, product),
    down,
    ltv: quote.ltv,
    loan: quote.loan,
    product,
    io,
    rate: quote.rate,
    pointsPct: quote.pointsPct,
    payment: Math.round(quote.piti),
    cashToClose: quote.cashToClose,
    dscr: quote.dscr,
    cashFlow: Math.round(quote.cashflow),
    annualCashFlow: Math.round(quote.cashflow * 12),
    coc: quote.coc,
    reserves: quote.reserves,
    ppp: input.ppp ?? 36,
    eligible: quote.eligible,
    laneLabel: quote.laneLabel,
    quote,
  };
}

function goalMetric(row: ScenarioRow, goal: BorrowerGoal): number {
  switch (goal) {
    case "cash-flow":
      return row.cashFlow;
    case "capital-efficiency":
      return -row.cashToClose;
    case "return":
      return row.coc;
    case "dscr":
      return row.dscr;
    case "lowest-rate":
      return row.rate != null ? -row.rate : -Infinity;
    case "lowest-payment":
      return -row.payment;
    default:
      return row.coc;
  }
}

function pickLeader(rows: ScenarioRow[], metric: (r: ScenarioRow) => number, label: string): ObjectiveLeader | null {
  if (!rows.length) return null;
  const best = rows.reduce((a, b) => (metric(b) > metric(a) ? b : a));
  return { objective: label, rowId: best.id, label: `${best.down}% down · ${PRODUCTS.find((p) => p.product === best.product)?.label ?? best.product}` };
}

export function runScenarioEngine(
  deal: DealState,
  goal: BorrowerGoal = "return",
): ScenarioEngineResult {
  const rows: ScenarioRow[] = [];
  const seen = new Set<string>();

  for (const down of DOWN_RUNGS) {
    for (const { product, io } of PRODUCTS) {
      const id = rowId(down, product);
      if (seen.has(id)) continue;
      seen.add(id);
      rows.push(buildRow(deal, down, product, io));
    }
  }

  const eligibleRows = rows.filter((r) => r.eligible && r.quote.lane !== "decline");

  const leaders: ObjectiveLeader[] = [];
  const cashFlowLeader = pickLeader(eligibleRows, (r) => r.cashFlow, "Highest cash flow");
  const cocLeader = pickLeader(eligibleRows, (r) => r.coc, "Highest return");
  const ctcLeader = pickLeader(eligibleRows, (r) => -r.cashToClose, "Capital efficiency");
  const dscrLeader = pickLeader(eligibleRows, (r) => r.dscr, "Highest DSCR");
  const rateLeader = pickLeader(eligibleRows, (r) => (r.rate != null ? -r.rate : -Infinity), "Lowest rate");
  const payLeader = pickLeader(eligibleRows, (r) => -r.payment, "Lowest payment");
  [cashFlowLeader, cocLeader, ctcLeader, dscrLeader, rateLeader, payLeader].forEach((l) => {
    if (l) leaders.push(l);
  });

  const defaultPool = eligibleRows.filter((r) => r.dscr >= 1.1 && r.cashFlow > 0);
  const pool = defaultPool.length ? defaultPool : eligibleRows;
  const recommended =
    pool.length > 0
      ? pool.reduce((a, b) => (goalMetric(b, goal) > goalMetric(a, goal) ? b : a))
      : null;

  const constraints = buildConstraintPath(deal, rows);

  return { rows, eligibleRows, leaders, recommended, constraints };
}

export function buildConstraintPath(deal: DealState, rows?: ScenarioRow[]): ConstraintLever[] {
  const base = dealToEngineInput(deal);
  const quote = solve(base);
  const levers: ConstraintLever[] = [];

  if (quote.eligible) return levers;

  if (quote.dscr < 1 && quote.dscr >= 0.75) {
    const pitia = quote.piti;
    const neededRent = Math.ceil(pitia * 1.0);
    levers.push({
      lever: "More rent",
      description: "Monthly rent needed to reach DSCR 1.00 at current leverage",
      value: `$${neededRent.toLocaleString()}/mo`,
    });
  }

  for (const down of [30, 35, 40, 45, 50]) {
    const q = solve(dealToEngineInput(deal, { down }));
    if (q.eligible && q.dscr >= 1) {
      levers.push({
        lever: "More down",
        description: "Down payment that clears Standard DSCR",
        value: `${down}% (${q.ltv}% LTV)`,
      });
      break;
    }
  }

  const ioQuote = solve(dealToEngineInput(deal, { io: true }));
  if (ioQuote.eligible && !quote.eligible) {
    levers.push({
      lever: "Interest-only",
      description: "Switch to I-O to lower payment and lift DSCR",
      value: ioQuote.laneLabel,
    });
  }

  if (quote.superEligible) {
    levers.push({
      lever: "Asset-qualified",
      description: "Use liquid assets to supplement DSCR",
      value: "Final DSCR ≥ 1.15",
    });
  }

  if (quote.lane === "decline") {
    levers.push({
      lever: "Income-qualified",
      description: "Route to full-doc path when DSCR programs don't fit",
    });
  }

  return levers;
}

export function rankByGoal(rows: ScenarioRow[], goal: BorrowerGoal): ScenarioRow[] {
  return [...rows].sort((a, b) => goalMetric(b, goal) - goalMetric(a, goal));
}

export function deltaVs(current: ScenarioRow, other: ScenarioRow) {
  return {
    cashFlow: other.cashFlow - current.cashFlow,
    cashToClose: other.cashToClose - current.cashToClose,
    rate: (other.rate ?? 0) - (current.rate ?? 0),
    dscr: other.dscr - current.dscr,
    payment: other.payment - current.payment,
  };
}
