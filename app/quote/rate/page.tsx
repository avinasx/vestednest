"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { QuoteFlowShell, fmtMoney } from "@/components/quote/quote-flow-shell";
import { dealToPricePayload, fetchPrice, fetchRateLadder } from "@/lib/deal/api";
import { useDeal } from "@/lib/deal/context";

import type { LadderRow } from "@/lib/deal/api";

export default function ChooseRatePage() {
  const router = useRouter();
  const { deal, setDeal } = useDeal();
  const [ladder, setLadder] = useState<LadderRow[]>([]);
  const [parIndex, setParIndex] = useState(0);
  const [sel, setSel] = useState(0);
  const [escrowWaiver, setEscrowWaiver] = useState(deal.escrowWaiver ?? false);
  const [holdSel, setHoldSel] = useState<number | null>(
    deal.holdPeriod === "2-3" ? 3 : deal.holdPeriod === "5" ? 5 : deal.holdPeriod === "7" ? 7 : deal.holdPeriod === "10+" ? 10 : null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deal.intel) void router.replace("/quote");
  }, [deal.intel, router]);

  useEffect(() => {
    if (!deal.intel) return;
    setLoading(true);
    void fetchRateLadder({ ...dealToPricePayload(deal), escrowWaiver })
      .then((res) => {
        const rows = res.ladder.map((r) => ({ ...r }));
        setLadder(rows);
        setParIndex(res.parIndex);
        setSel(res.parIndex);
      })
      .finally(() => setLoading(false));
  }, [deal, escrowWaiver]);

  const r = ladder[sel];
  const par = ladder[parIndex];

  const bePanel = useMemo(() => {
    if (!r || !par) return null;
    const cost = r.pointsPct > 0.05;
    if (!cost) {
      return (
        <div className="quote-card" style={{ marginTop: 12 }}>
          <p style={{ fontSize: 14 }}>
            You&apos;re at the no-points rate
            {r.pointsPct < -0.05 ? " and taking a credit toward closing" : ""} — buy down only if
            you&apos;ll hold past breakeven.
          </p>
        </div>
      );
    }
    const save = par.payment - r.payment;
    const months = save > 0 ? Math.ceil(r.pointsDollars / save) : 0;
    const horizons = [3, 5, 7, 10, 15];
    const netAt = (y: number) => Math.round(save * y * 12 - r.pointsDollars);
    return (
      <div className="quote-card" style={{ marginTop: 12 }}>
        <div className="quote-label">Is buying it down worth it?</div>
        <div className="quote-row">
          <span>Payment at this rate</span>
          <span className="v">{fmtMoney(r.payment)}/mo</span>
        </div>
        <div className="quote-row">
          <span>vs no-points rate</span>
          <span className="v">{fmtMoney(par.payment)}/mo</span>
        </div>
        <div className="quote-row">
          <span>Breakeven</span>
          <span className="v">
            {months} mo (~{(months / 12).toFixed(1)} yr)
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5, marginTop: 10 }}>
          {horizons.map((y) => {
            const net = netAt(y);
            const wn = net >= 0;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setHoldSel(holdSel === y ? null : y)}
                style={{
                  borderRadius: 8,
                  padding: "7px 2px",
                  border: `1px solid ${wn ? "#cfe7d8" : "#efe1c0"}`,
                  background: wn ? "var(--green-l)" : "var(--amber-l)",
                  boxShadow: holdSel === y ? "0 0 0 2px var(--green)" : undefined,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--slate)" }}>{y} yr</div>
                <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11 }}>
                  {net >= 0 ? "+" : "−"}
                  {fmtMoney(Math.abs(net))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [r, par, holdSel]);

  async function onContinue() {
    if (!r) return;
    const { quote } = await fetchPrice({
      ...dealToPricePayload(deal),
      selectedRate: r.rate,
      escrowWaiver,
    });
    setDeal({ selectedRate: r.rate, escrowWaiver, quote });
    await router.push("/quote/term-sheet");
  }

  if (loading || !r) {
    return (
      <QuoteFlowShell step={5}>
        <p>Loading rate options…</p>
      </QuoteFlowShell>
    );
  }

  function ptsLabel(row: LadderRow) {
    if (Math.abs(row.pointsPct) < 0.05) return "0 pts";
    if (row.pointsPct > 0) return `${row.pointsPct.toFixed(2)} pts`;
    return `${(-row.pointsPct).toFixed(2)} pts credit`;
  }

  return (
    <QuoteFlowShell step={5}>
      <h1 className="quote-h1">Pick the rate that fits your plan.</h1>
      <ul style={{ fontSize: 15, marginBottom: 14, paddingLeft: 20 }}>
        <li>
          <b>Lower rate</b> = pay points now to buy it down.
        </li>
        <li>
          <b>Higher rate</b> = take a credit toward closing costs.
        </li>
      </ul>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { id: false, label: "Include escrow", desc: "We collect & pay taxes + insurance" },
          { id: true, label: "Waive escrow", desc: "You pay them yourself" },
        ].map((o) => (
          <button
            key={String(o.id)}
            type="button"
            onClick={() => setEscrowWaiver(o.id)}
            style={{
              flex: 1,
              textAlign: "left",
              padding: "9px 13px",
              borderRadius: 11,
              border: `1.5px solid ${escrowWaiver === o.id ? "var(--green)" : "var(--line)"}`,
              background: escrowWaiver === o.id ? "var(--green-l)" : "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14 }}>{o.label}</div>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>{o.desc}</div>
          </button>
        ))}
      </div>

      <div className="rate-grid">
        <div className="rate-ladder">
          <div className="rate-lhead">
            <div>Rate</div>
            <div>Monthly payment</div>
            <div>Points</div>
          </div>
          {ladder.map((row, i) => (
            <div
              key={row.rate}
              className={`rate-lrow${i === sel ? " sel" : ""}`}
              onClick={() => setSel(i)}
              onKeyDown={(e) => e.key === "Enter" && setSel(i)}
              role="button"
              tabIndex={0}
            >
              <div style={{ fontFamily: "monospace", fontWeight: 700 }}>
                {row.rate.toFixed(3)}%
                {i === parIndex ? (
                  <span
                    style={{
                      fontSize: 9,
                      background: "var(--green)",
                      color: "#fff",
                      borderRadius: 999,
                      padding: "2px 6px",
                      marginLeft: 6,
                    }}
                  >
                    0 points
                  </span>
                ) : null}
              </div>
              <div>{fmtMoney(row.payment)}</div>
              <div style={{ color: row.pointsPct < -0.05 ? "var(--green)" : undefined }}>
                {ptsLabel(row)}
              </div>
            </div>
          ))}
        </div>

        <div className="rate-panel">
          <div className="rate-big">{r.rate.toFixed(3)}%</div>
          <p style={{ fontSize: 13, color: "var(--slate)" }}>
            30-yr fixed · DSCR {r.dscr.toFixed(2)}×
          </p>
          <div className="quote-row">
            <span>Monthly payment</span>
            <span className="v">{fmtMoney(r.payment)}</span>
          </div>
          <div className="quote-row">
            <span>Cash to close</span>
            <span className="v">{fmtMoney(r.cashToClose)}</span>
          </div>
          <div className="quote-reserves">
            <span>
              Reserves to show — <b>not paid at closing</b>
            </span>
            <span className="v">{fmtMoney(r.reserves)}</span>
          </div>
          {bePanel}
          <button type="button" className="quote-btn" onClick={() => void onContinue()}>
            Continue to term sheet →
          </button>
          <p style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 11 }}>
            Indicative only — subject to appraisal, rent determination, and final underwriting.
          </p>
        </div>
      </div>

      <Link href="/quote/scenario" className="quote-btn secondary">
        ← Back
      </Link>
    </QuoteFlowShell>
  );
}
