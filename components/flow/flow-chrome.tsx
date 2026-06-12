"use client";

import type { ReactNode } from "react";
import type { useLoanFlow } from "./use-loan-flow";

export const FLOW_STEPS = [
  "Chat Flow",
  "Report Metadata",
  "Property Intelligence",
  "Loan Structure",
  "Term Sheet",
  "Pre-Qualification",
  "Close Tracker",
] as const;

type LoanFlow = ReturnType<typeof useLoanFlow>;

export function FlowSidebar({ f }: { f: LoanFlow }) {
  return (
    <aside className="flow-sidebar-card">
      <div className="flow-sidebar-title">Your loan journey</div>
      <div className="flow-stepper">
        {FLOW_STEPS.map((label, i) => {
          const n = i + 1;
          const active = f.screen === n;
          const done = f.screen > n;
          return (
            <div key={label}>
              <div
                className={`flow-stepper-item${active ? " active" : ""}${done ? " done" : ""}`}
                aria-current={active ? "step" : undefined}
              >
                <span className="flow-stepper-num">{done ? "✓" : n}</span>
                <span className="flow-stepper-label">{label}</span>
              </div>
              {i < FLOW_STEPS.length - 1 ? <div className="flow-stepper-connector" aria-hidden /> : null}
            </div>
          );
        })}
      </div>
      <div className="flow-sidebar-ft">
        <button type="button" className="flow-sidebar-restart" onClick={f.resetFlow}>
          Restart
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10m0 0-4-4m4 4-4 4" stroke="#24933e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export function FlowChrome({ f, children }: { f: LoanFlow; children: ReactNode }) {
  return (
    <div className="flow-shell">
      <div className="flow-shell-grid" aria-hidden />
      <div className="flow-stage">
        <FlowSidebar f={f} />
        <div className="flow-main">{children}</div>
      </div>
      <button
        type="button"
        className="flow-help-fab"
        aria-label="Close and return home"
        onClick={() => f.goTo(0)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
