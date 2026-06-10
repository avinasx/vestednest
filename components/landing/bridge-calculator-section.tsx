"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { CheckItem } from "./check-item";
import { SectionLabel } from "./section-label";

const CHECKS = [
  "No prepay penalty after 6 months",
  "Re-uses your bridge appraisal where allowed",
  "Same-week underwriting decision",
];

const DSCR_RATE = 0.0799;

function fmtUsd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

type BridgeCalculatorSectionProps = {
  onStart: (text?: string) => void;
};

export function BridgeCalculatorSection({ onStart }: BridgeCalculatorSectionProps) {
  const [loanAmount, setLoanAmount] = useState(400_000);
  const [bridgeRate, setBridgeRate] = useState(12);
  const [daysSaved, setDaysSaved] = useState(31);

  const dailyBleed = (loanAmount * (bridgeRate / 100 - DSCR_RATE)) / 365;
  const totalSaved = dailyBleed * daysSaved;
  const monthlySaved = dailyBleed * 30;

  return (
    <section className="landing-bridge">
      <img src="/landing/calc-bg.png" alt="" className="landing-bridge-bg" aria-hidden />
      <div className="landing-section-inner">
        <div className="landing-bridge-grid">
          <div>
            <SectionLabel>Bridge → DSCR</SectionLabel>
            <h2 className="landing-bridge-title">
              Still sitting in a 12% bridge?{" "}
              <span className="landing-serif">Every day costs you money.</span>
            </h2>
            <p className="landing-bridge-lead">
              Bridge interest compounds against your margin every day. We close in 14. Plug your
              numbers in — see what 30 days back in your pocket actually looks like.
            </p>
            <div className="landing-bridge-checks">
              {CHECKS.map((check) => (
                <CheckItem key={check} light>
                  {check}
                </CheckItem>
              ))}
            </div>
            <button
              type="button"
              className="landing-bridge-cta"
              onClick={() => onStart("I want to refi out of my bridge loan into DSCR")}
            >
              Calculate my bridge savings
              <img src="/landing/icon-arrow-right.svg" alt="" aria-hidden />
            </button>
          </div>
          <div className="landing-calc">
            <span className="landing-calc-corner landing-calc-corner--tl" aria-hidden />
            <span className="landing-calc-corner landing-calc-corner--tr" aria-hidden />
            <span className="landing-calc-corner landing-calc-corner--bl" aria-hidden />
            <span className="landing-calc-corner landing-calc-corner--br" aria-hidden />
            <h3 className="landing-calc-title">Bridge Savings Calculator</h3>
            <div className="landing-calc-row">
              <div>
                <p className="landing-calc-label">Loan Amount</p>
                <p className="landing-calc-value">{fmtUsd(loanAmount)}</p>
              </div>
              <input
                type="range"
                className="landing-calc-slider"
                min={100_000}
                max={2_000_000}
                step={10_000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                aria-label="Loan amount"
              />
            </div>
            <div className="landing-calc-row">
              <div>
                <p className="landing-calc-label">Bridge Rate</p>
                <p className="landing-calc-value">{bridgeRate.toFixed(2)}%</p>
              </div>
              <input
                type="range"
                className="landing-calc-slider"
                min={9}
                max={15}
                step={0.25}
                value={bridgeRate}
                onChange={(e) => setBridgeRate(Number(e.target.value))}
                aria-label="Bridge rate"
              />
            </div>
            <div className="landing-calc-row">
              <div>
                <p className="landing-calc-label">Days Saved on Exit</p>
                <p className="landing-calc-value">{daysSaved} days</p>
              </div>
              <input
                type="range"
                className="landing-calc-slider"
                min={7}
                max={60}
                step={1}
                value={daysSaved}
                onChange={(e) => setDaysSaved(Number(e.target.value))}
                aria-label="Days saved on exit"
              />
            </div>
            <div className="landing-calc-results">
              <div className="landing-calc-result landing-calc-result--primary">
                <p className="landing-calc-result-label">You save</p>
                <p className="landing-calc-result-value">{fmtUsd(totalSaved)}</p>
                <p className="landing-calc-result-note">
                  over {daysSaved} days by exiting the bridge into our DSCR
                </p>
              </div>
              <div className="landing-calc-result">
                <p className="landing-calc-result-label">Daily bleed avoided</p>
                <p className="landing-calc-result-value">{fmtUsd(dailyBleed)}</p>
              </div>
              <div className="landing-calc-result">
                <p className="landing-calc-result-label">Monthly carry saved</p>
                <p className="landing-calc-result-value">{fmtUsd(monthlySaved)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
