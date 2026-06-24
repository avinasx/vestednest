"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuoteFlowShell } from "@/components/quote/quote-flow-shell";
import { dealToPricePayload, fetchPrice } from "@/lib/deal/api";
import { useDeal } from "@/lib/deal/context";

export default function NumbersStepPage() {
  const router = useRouter();
  const { deal, setDeal } = useDeal();
  const [fico, setFico] = useState(deal.fico ?? 752);
  const [ficoUnknown, setFicoUnknown] = useState(deal.ficoUnknown ?? false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!deal.intel) void router.replace("/quote");
  }, [deal.intel, router]);

  async function onContinue() {
    setLoading(true);
    const patch = {
      fico,
      ficoUnknown,
      borrowerType: deal.borrowerType ?? "llc",
      purpose: deal.purpose ?? "purchase",
      str: deal.str ?? false,
    } as const;
    setDeal(patch);
    try {
      const { quote } = await fetchPrice(dealToPricePayload({ ...deal, ...patch }));
      setDeal({ quote });
      await router.push("/quote/scenario");
    } finally {
      setLoading(false);
    }
  }

  if (!deal.intel) return null;

  return (
    <QuoteFlowShell step={3}>
      <h1 className="quote-h1">Your numbers</h1>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>
        A few inputs to price your deal — no credit pull yet.
      </p>

      <div className="quote-card">
        <div className="quote-label">Credit score (FICO)</div>
        <input
          className="quote-input"
          type="range"
          min={620}
          max={850}
          value={ficoUnknown ? 700 : fico}
          disabled={ficoUnknown}
          onChange={(e) => setFico(Number(e.target.value))}
        />
        <input
          className="quote-input"
          type="number"
          value={ficoUnknown ? "" : fico}
          disabled={ficoUnknown}
          onChange={(e) => setFico(Number(e.target.value))}
        />
        <label style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 14 }}>
          <input type="checkbox" checked={ficoUnknown} onChange={(e) => setFicoUnknown(e.target.checked)} />
          I don&apos;t know my score
        </label>

        <div style={{ marginTop: 20 }}>
          <div className="quote-label">Hold title as</div>
          <select
            className="quote-input"
            value={deal.borrowerType ?? "llc"}
            onChange={(e) =>
              setDeal({ borrowerType: e.target.value as "llc" | "individual" | "foreign" })
            }
          >
            <option value="llc">LLC</option>
            <option value="individual">Individual</option>
            <option value="foreign">Foreign national</option>
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="quote-label">Loan purpose</div>
          <select
            className="quote-input"
            value={deal.purpose ?? "purchase"}
            onChange={(e) => setDeal({ purpose: e.target.value as "purchase" | "rt" | "cashout" })}
          >
            <option value="purchase">Purchase</option>
            <option value="rt">Rate & term refi</option>
            <option value="cashout">Cash-out refi</option>
          </select>
        </div>

        <label style={{ display: "flex", gap: 8, marginTop: 16, fontSize: 14 }}>
          <input
            type="checkbox"
            checked={deal.str ?? false}
            onChange={(e) => setDeal({ str: e.target.checked })}
          />
          Short-term rental (Airbnb / STR)
        </label>
      </div>

      <button type="button" className="quote-btn" onClick={() => void onContinue()} disabled={loading}>
        {loading ? "Pricing…" : "See structure options →"}
      </button>
      <Link href="/quote/property" className="quote-btn secondary" style={{ marginTop: 8 }}>
        ← Back
      </Link>
    </QuoteFlowShell>
  );
}
