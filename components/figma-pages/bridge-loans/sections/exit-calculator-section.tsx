"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type CSSProperties } from "react";
import { BRIDGE_EXIT } from "../content";
import { SectionHeader } from "../section-header";

const DSCR_RATE = 0.0799;

function fmtUsd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function pct(min: number, max: number, value: number) {
  return `${((value - min) / (max - min)) * 100}%`;
}

export function BridgeExitCalculatorSection() {
  const [loanAmount, setLoanAmount] = useState(400_000);
  const [bridgeRate, setBridgeRate] = useState(12);
  const [daysSaved, setDaysSaved] = useState(31);

  const dailyBleed = (loanAmount * (bridgeRate / 100 - DSCR_RATE)) / 365;
  const totalSaved = dailyBleed * daysSaved;
  const monthlySaved = dailyBleed * 30;

  return (
    <section className="bl-section bl-section--white">
      <div className="bl-inner bl-text-center">
        <SectionHeader
          label={BRIDGE_EXIT.label}
          title={
            <>
              Bridge → DSCR.
              <br />
              <em>Same team. No friction.</em>
            </>
          }
          lead={BRIDGE_EXIT.lead}
        />
      </div>

      <div className="bl-inner bl-exit-cards">
        {BRIDGE_EXIT.cards.map((card) => (
          <article key={card.title} className="bl-exit-card">
            <div className="bl-exit-icon">
              <img src={card.icon} alt="" aria-hidden />
            </div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      <div className="bl-inner bl-calculator-layout">
        <div className="bl-calculator">
          <h3 className="bl-calculator-title">Bridge Savings Calculator</h3>

          <div className="bl-slider-block">
            <span className="bl-slider-label">Loan Amount</span>
            <span className="bl-slider-value">{fmtUsd(loanAmount)}</span>
            <input
              type="range"
              className="bl-slider"
              min={150_000}
              max={3_000_000}
              step={10_000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              aria-label="Loan amount"
              style={{ "--progress": pct(150_000, 3_000_000, loanAmount) } as CSSProperties}
            />
          </div>

          <hr className="bl-calculator-divider" />

          <div className="bl-slider-block">
            <span className="bl-slider-label">Bridge Rate</span>
            <span className="bl-slider-value">{bridgeRate.toFixed(2)}%</span>
            <input
              type="range"
              className="bl-slider"
              min={9}
              max={15}
              step={0.25}
              value={bridgeRate}
              onChange={(e) => setBridgeRate(Number(e.target.value))}
              aria-label="Bridge rate"
              style={{ "--progress": pct(9, 15, bridgeRate) } as CSSProperties}
            />
          </div>

          <hr className="bl-calculator-divider" />

          <div className="bl-slider-block">
            <span className="bl-slider-label">Days Saved on Exit</span>
            <span className="bl-slider-value">{daysSaved} days</span>
            <input
              type="range"
              className="bl-slider"
              min={7}
              max={90}
              step={1}
              value={daysSaved}
              onChange={(e) => setDaysSaved(Number(e.target.value))}
              aria-label="Days saved on exit"
              style={{ "--progress": pct(7, 90, daysSaved) } as CSSProperties}
            />
          </div>
        </div>

        <div className="bl-calculator-results">
          <div className="bl-result bl-result--primary">
            <span className="bl-result-label">You save</span>
            <span className="bl-result-value">{fmtUsd(totalSaved)}</span>
            <p className="bl-result-note">over {daysSaved} days by exiting the bridge</p>
          </div>
          <div className="bl-result">
            <span className="bl-result-label">Daily bleed avoided</span>
            <span className="bl-result-value">{fmtUsd(dailyBleed)}</span>
          </div>
          <div className="bl-result">
            <span className="bl-result-label">Monthly carry saved</span>
            <span className="bl-result-value">{fmtUsd(monthlySaved)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
