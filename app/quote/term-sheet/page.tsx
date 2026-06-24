"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuoteFlowShell, fmtMoney } from "@/components/quote/quote-flow-shell";
import { useDeal } from "@/lib/deal/context";
import { trackEvent } from "@/lib/analytics/events";

export default function TermSheetPage() {
  const router = useRouter();
  const { deal, saveDraft } = useDeal();
  const q = deal.quote;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!deal.intel || !q) void router.replace("/quote/scenario");
    else {
      trackEvent("quote_generated", { loan_amount: q.loan, value: q.loan });
      void saveDraft();
    }
  }, [deal.intel, q, router, saveDraft]);

  if (!q) return null;

  const canPrequal = deal.fundingLane !== "ecc-referral" && deal.fundingLane !== "excluded";

  async function downloadPdf() {
    trackEvent("term_sheet_downloaded", { loan_amount: q!.loan });
    const res = await fetch("/api/term-sheet/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal, quote: q }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vestednest-term-sheet.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function emailSheet() {
    if (!email) return;
    setStatus("Sending…");
    const res = await fetch("/api/term-sheet/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deal, quote: q }),
    });
    setStatus(res.ok ? "Sent!" : "Failed to send");
  }

  return (
    <QuoteFlowShell step={6}>
      <h1 className="quote-h1">Your term sheet</h1>
      <p style={{ color: "var(--slate)", marginBottom: 8 }}>{deal.formattedAddress}</p>
      <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>
        Indicative quote — not a commitment to lend. {q.laneLabel}.
      </p>

      <div className="quote-card">
        <div className="quote-row">
          <span>Rate</span>
          <span className="v">{q.rate?.toFixed(3)}%</span>
        </div>
        <div className="quote-row">
          <span>Loan amount</span>
          <span className="v">{fmtMoney(q.loan)}</span>
        </div>
        <div className="quote-row">
          <span>LTV</span>
          <span className="v">{q.ltv}%</span>
        </div>
        <div className="quote-row">
          <span>Monthly payment</span>
          <span className="v">{fmtMoney(Math.round(q.piti))}</span>
        </div>
        <div className="quote-row">
          <span>DSCR</span>
          <span className="v">{q.dscr.toFixed(2)}×</span>
        </div>
        <div className="quote-row">
          <span>Cash to close</span>
          <span className="v">{fmtMoney(q.cashToClose)}</span>
        </div>
        <div className="quote-reserves">
          <span>
            Reserves to show — <b>not paid at closing</b>
          </span>
          <span className="v">{fmtMoney(q.reserves)}</span>
        </div>
      </div>

      {q.closing?.fees?.length > 0 && (
        <div className="quote-card">
          <div className="quote-label">Closing costs</div>
          {q.closing.fees.map((f) => (
            <div key={f.name} className="quote-row">
              <span>{f.name}</span>
              <span className="v">{fmtMoney(f.value)}</span>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="quote-btn" onClick={() => void downloadPdf()}>
        Download PDF
      </button>

      <div className="quote-card" style={{ marginTop: 16 }}>
        <div className="quote-label">Email term sheet</div>
        <input
          className="quote-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="button" className="quote-btn secondary" onClick={() => void emailSheet()}>
          Send
        </button>
        {status && <p style={{ fontSize: 13, marginTop: 8 }}>{status}</p>}
      </div>

      {canPrequal ? (
        <Link
          href="/prequalify"
          className="quote-btn"
          onClick={() => {
            void saveDraft();
            trackEvent("prequal_started", { loan_amount: q.loan });
          }}
        >
          Get pre-qualified — soft pull, won&apos;t affect your credit
        </Link>
      ) : (
        <div className="lane-banner ecc" style={{ marginTop: 16 }}>
          Pre-qualification in this state goes through our licensed partner. We&apos;ve saved your
          scenario — a loan advisor will follow up.
        </div>
      )}

      <Link href="/quote/rate" className="quote-btn secondary">
        ← Back
      </Link>
    </QuoteFlowShell>
  );
}
