"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuoteFlowShell, fmtMoney } from "@/components/quote/quote-flow-shell";
import { useDeal } from "@/lib/deal/context";

export default function PropertyStepPage() {
  const router = useRouter();
  const { deal, setDeal } = useDeal();
  const [rent, setRent] = useState(deal.monthlyRent ?? 0);
  const [insurance, setInsurance] = useState(deal.insuranceAnnual ?? 2400);

  useEffect(() => {
    if (!deal.intel) void router.replace("/quote");
  }, [deal.intel, router]);

  if (!deal.intel) return null;

  const valueMid = deal.value ?? deal.intel.marketValue ?? 0;

  return (
    <QuoteFlowShell step={2}>
      {deal.fundingLane === "ecc-referral" && (
        <div className="lane-banner ecc">
          For loans in {deal.intel.state}, we work through our licensed partner — numbers here are
          indicative.
        </div>
      )}
      {deal.fundingLane === "excluded" && (
        <div className="lane-banner excluded">
          We can&apos;t fund in this state today — you can still explore the math and we&apos;ll capture
          your info.
        </div>
      )}

      <h1 className="quote-h1">Your property</h1>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>{deal.formattedAddress}</p>

      <div className="quote-card">
        <div className="quote-label">Estimated value</div>
        <div className="quote-range">
          <b>{fmtMoney(Math.round(valueMid * 0.95))}</b>
          <span>–</span>
          <b>{fmtMoney(Math.round(valueMid * 1.05))}</b>
          <span>(market AVM)</span>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="quote-label">Estimated rent / mo</div>
          <input
            className="quote-input"
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
          />
          <p style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>
            Override if you know the actual rent.
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="quote-label">Insurance / year (est.)</div>
          <input
            className="quote-input"
            type="number"
            value={insurance}
            onChange={(e) => setInsurance(Number(e.target.value))}
          />
        </div>

        <div className="quote-row">
          <span>Annual taxes</span>
          <span className="v">{fmtMoney(deal.intel.annualTax ?? 0)}</span>
        </div>
        <div className="quote-row">
          <span>Property type</span>
          <span className="v">{deal.intel.propertyType ?? "SFR"}</span>
        </div>
      </div>

      <Link
        href="/quote/numbers"
        className="quote-btn"
        onClick={() => setDeal({ monthlyRent: rent, insuranceAnnual: insurance, value: valueMid })}
      >
        Continue →
      </Link>
    </QuoteFlowShell>
  );
}
