"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuoteFlowShell, fmtMoney } from "@/components/quote/quote-flow-shell";
import { useDeal } from "@/lib/deal/context";
import type { CloseTrackerData } from "@/components/flow/types";

export default function PortalPage() {
  const router = useRouter();
  const { deal } = useDeal();
  const [tracker, setTracker] = useState<CloseTrackerData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (!j.user) void router.replace("/prequalify");
        else setAuthChecked(true);
      })
      .catch(() => void router.replace("/prequalify"));
  }, [router]);

  useEffect(() => {
    if (!deal.applicationId || !authChecked) return;
    void fetch(`/api/close-tracker?id=${deal.applicationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setTracker(data);
      })
      .catch(() => null);
  }, [deal.applicationId, authChecked]);

  if (!authChecked) {
    return (
      <QuoteFlowShell step={7}>
        <p>Loading your portal…</p>
      </QuoteFlowShell>
    );
  }

  const steps = tracker?.steps ?? [];

  return (
    <QuoteFlowShell step={7}>
      <h1 className="quote-h1">Track your close</h1>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>
        {deal.formattedAddress ?? tracker?.application?.address ?? "Your application"}
      </p>

      {deal.quote && (
        <div className="quote-card">
          <div className="quote-row">
            <span>Rate</span>
            <span className="v">{deal.quote.rate?.toFixed(3)}%</span>
          </div>
          <div className="quote-row">
            <span>Loan</span>
            <span className="v">{fmtMoney(deal.quote.loan)}</span>
          </div>
        </div>
      )}

      {steps.length > 0 ? (
        <div className="quote-card">
          <div className="quote-label">Timeline</div>
          {steps.map((s) => (
            <div key={s.label} className="quote-row">
              <span>{s.label}</span>
              <span className="v" style={{ fontSize: 12, textTransform: "uppercase" }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="quote-card">
          <p style={{ fontSize: 14, color: "var(--slate)" }}>
            Your application is in. A loan advisor will reach out within one business day with next
            steps.
          </p>
        </div>
      )}

      {tracker?.loanOfficer && (
        <div className="quote-card">
          <div className="quote-label">Your loan advisor</div>
          <p style={{ fontWeight: 700 }}>{tracker.loanOfficer.name}</p>
          <p style={{ fontSize: 14, color: "var(--slate)" }}>{tracker.loanOfficer.email}</p>
        </div>
      )}

      {tracker?.daysToClose != null && (
        <p style={{ fontSize: 13, color: "var(--slate)", marginTop: 16 }}>
          Estimated {tracker.daysToClose} days to close. We&apos;ll email you at each milestone.
        </p>
      )}
    </QuoteFlowShell>
  );
}
