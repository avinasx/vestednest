"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuoteFlowShell, fmtMoney } from "@/components/quote/quote-flow-shell";
import { fetchScenario } from "@/lib/deal/api";
import { useDeal } from "@/lib/deal/context";
import type { BorrowerGoal, ScenarioRow } from "@/lib/deal/types";
import type { ScenarioEngineResult } from "@/lib/scenario-engine";
import { deltaVs } from "@/lib/scenario-engine";

const GOALS: { id: BorrowerGoal; label: string; hint: string }[] = [
  { id: "return", label: "Best return", hint: "Highest cash-on-cash" },
  { id: "cash-flow", label: "Most cash flow", hint: "Biggest monthly profit" },
  { id: "capital-efficiency", label: "Least cash in", hint: "Buy more doors" },
  { id: "dscr", label: "Strongest DSCR", hint: "Most cushion" },
  { id: "lowest-payment", label: "Lowest payment", hint: "Smallest monthly check" },
  { id: "lowest-rate", label: "Lowest rate", hint: "Smallest rate number" },
];

export default function ScenarioStepPage() {
  const router = useRouter();
  const { deal, setDeal } = useDeal();
  const [result, setResult] = useState<ScenarioEngineResult | null>(null);
  const [goal, setGoal] = useState<BorrowerGoal>(deal.borrowerGoal ?? "return");
  const [selected, setSelected] = useState<ScenarioRow | null>(deal.scenarioSelection ?? null);
  const [holdPeriod, setHoldPeriod] = useState(deal.holdPeriod ?? "not-sure");

  useEffect(() => {
    if (!deal.intel) void router.replace("/quote");
    else {
      void fetchScenario(deal, goal).then(setResult);
    }
  }, [deal, goal, router]);

  useEffect(() => {
    if (result?.recommended && !selected) setSelected(result.recommended);
  }, [result, selected]);

  if (!deal.intel || !result) {
    return (
      <QuoteFlowShell step={4}>
        <p>Building scenarios…</p>
      </QuoteFlowShell>
    );
  }

  const rec = selected ?? result.recommended;

  return (
    <QuoteFlowShell step={4}>
      <h1 className="quote-h1">Pick your structure</h1>
      <p style={{ color: "var(--slate)", marginBottom: 12 }}>
        What matters most? We&apos;ll rank options by your goal — every number comes from the engine.
      </p>

      <div className="scenario-pills">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`scenario-pill${goal === g.id ? " on" : ""}`}
            onClick={() => setGoal(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {rec && (
        <div className="quote-card">
          <div className="quote-label">Recommended</div>
          <p style={{ fontSize: 18, fontWeight: 700, margin: "8px 0" }}>
            {rec.down}% down · {rec.laneLabel}
          </p>
          <div className="quote-row">
            <span>Rate</span>
            <span className="v">{rec.rate?.toFixed(3)}%</span>
          </div>
          <div className="quote-row">
            <span>Monthly payment</span>
            <span className="v">{fmtMoney(rec.payment)}</span>
          </div>
          <div className="quote-row">
            <span>Cash flow / mo</span>
            <span className="v">{fmtMoney(rec.cashFlow)}</span>
          </div>
          <div className="quote-row">
            <span>Cash to close</span>
            <span className="v">{fmtMoney(rec.cashToClose)}</span>
          </div>
          <div className="quote-row">
            <span>DSCR</span>
            <span className="v">{rec.dscr.toFixed(2)}×</span>
          </div>
          <div className="quote-reserves">
            <span>
              Reserves to show — <b>not paid at closing</b>
            </span>
            <span className="v">{fmtMoney(rec.reserves)}</span>
          </div>
        </div>
      )}

      <div className="quote-card">
        <div className="quote-label">Compare products (at {rec?.down ?? 25}% down)</div>
        <table className="scenario-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Rate</th>
              <th>Payment</th>
              <th>DSCR</th>
              <th>Cash flow</th>
            </tr>
          </thead>
          <tbody>
            {(["fx30", "arm76", "io"] as const).map((product) => {
              const row = result.eligibleRows.find(
                (r) =>
                  r.down === (rec?.down ?? 25) &&
                  r.product === product &&
                  (product === "io" ? r.io : !r.io),
              );
              if (!row) {
                return (
                  <tr key={product}>
                    <td>{product === "fx30" ? "30-yr fixed" : product === "arm76" ? "7/6 ARM" : "Interest-only"}</td>
                    <td colSpan={4} style={{ color: "var(--slate)" }}>Not eligible at this structure</td>
                  </tr>
                );
              }
              return (
                <tr
                  key={product}
                  className={rec?.id === row.id ? "rec" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(row)}
                >
                  <td>{product === "fx30" ? "30-yr fixed" : product === "arm76" ? "7/6 ARM" : "Interest-only"}</td>
                  <td>{row.rate?.toFixed(3)}%</td>
                  <td>{fmtMoney(row.payment)}</td>
                  <td>{row.dscr.toFixed(2)}</td>
                  <td>{fmtMoney(row.cashFlow)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="quote-card">
        <div className="quote-label">Compare down payments</div>
        <table className="scenario-table">
          <thead>
            <tr>
              <th>Down</th>
              <th>Rate</th>
              <th>DSCR</th>
              <th>Cash flow</th>
              <th>CTC</th>
              <th>CoC</th>
            </tr>
          </thead>
          <tbody>
            {result.eligibleRows
              .filter((r) => r.product === "fx30" && !r.io)
              .slice(0, 5)
              .map((row) => (
                <tr
                  key={row.id}
                  className={rec?.id === row.id ? "rec" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(row)}
                >
                  <td>{row.down}%</td>
                  <td>{row.rate?.toFixed(3)}%</td>
                  <td>{row.dscr.toFixed(2)}</td>
                  <td>{fmtMoney(row.cashFlow)}</td>
                  <td>{fmtMoney(row.cashToClose)}</td>
                  <td>{row.coc.toFixed(1)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {rec &&
        result.leaders
          .filter((l) => l.rowId !== rec.id)
          .slice(0, 3)
          .map((l) => {
            const other = result.rows.find((r) => r.id === l.rowId);
            if (!other) return null;
            const d = deltaVs(rec, other);
            return (
              <p key={l.rowId} style={{ fontSize: 13, color: "var(--slate)" }}>
                {l.objective}: {fmtMoney(Math.abs(d.cashFlow))}/mo{" "}
                {d.cashFlow >= 0 ? "more" : "less"}, {fmtMoney(Math.abs(d.cashToClose))}{" "}
                {d.cashToClose >= 0 ? "more" : "less"} at closing
              </p>
            );
          })}

      {result.constraints.length > 0 && (
        <div className="quote-card">
          <div className="quote-label">Ways to qualify</div>
          {result.constraints.map((c) => (
            <div key={c.lever} className="quote-row">
              <span>{c.lever}</span>
              <span className="v">{c.value ?? c.description}</span>
            </div>
          ))}
        </div>
      )}

      <div className="quote-card">
        <div className="quote-label">How long will you hold this property?</div>
        <select
          className="quote-input"
          value={holdPeriod}
          onChange={(e) => setHoldPeriod(e.target.value as typeof holdPeriod)}
        >
          <option value="2-3">~2–3 years</option>
          <option value="5">~5 years</option>
          <option value="7">~7 years</option>
          <option value="10+">10+ years</option>
          <option value="not-sure">Not sure</option>
        </select>
      </div>

      <Link
        href="/quote/rate"
        className="quote-btn"
        onClick={() => {
          if (!rec) return;
          setDeal({
            scenarioSelection: rec,
            downPaymentPct: rec.down,
            product: rec.product,
            interestOnly: rec.io,
            quote: rec.quote,
            borrowerGoal: goal,
            holdPeriod,
          });
        }}
      >
        Choose your rate →
      </Link>
    </QuoteFlowShell>
  );
}
