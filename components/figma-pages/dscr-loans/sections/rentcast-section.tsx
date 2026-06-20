"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

const STEPS = [
  {
    time: "45 seconds",
    title: "Drop the address",
    body: "One field. We pull the parcel, rent comps, and market trend from Rentcast automatically.",
  },
  {
    time: "Instant",
    title: "AI calculates DSCR",
    body: "Monthly rent divided by PITIA — rate, points, and qualification rendered live.",
  },
  {
    time: "60 seconds total",
    title: "Rate, points, PITIA on screen",
    body: "No email gate. No 3-day TRID wait. Adjust levers and watch the term sheet update.",
  },
  {
    time: "Day 14",
    title: "Close",
    body: "Light borrower docs. Parallel underwriting. Dedicated funder who picks up the phone.",
  },
];

const STATS = [
  { label: "Rentcast Rent Est.", value: "$2,340/mo" },
  { label: "Monthly PITIA", value: "$1,773" },
  { label: "DSCR Ratio", value: "1.32x" },
  { label: "Rate Quoted", value: "7.99%" },
];

export function DscrRentcastSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="dscr-rentcast">
      <img
        src="/figma-assets/imgIcComplete02HandoffsBg1.png"
        alt=""
        aria-hidden
        className="dscr-rentcast-bg"
      />
      <div className="dscr-inner dscr-rentcast-layout">
        <div className="dscr-rentcast-left">
          <div className="dscr-label">
            <span className="dscr-label-dot" aria-hidden />
            The Rentcast hook
          </div>
          <h2 className="dscr-rentcast-title">
            How we calculate
            <br />
            <em>your DSCR.</em>
          </h2>
          <p className="dscr-rentcast-lead">
            You drop an address. We don&apos;t ask you to fill out a rent estimate form or upload a
            lease. Our AI pings the Rentcast API and pulls the rent comps for that specific property
            automatically.
          </p>
          <div className="dscr-example-card">
            <p className="dscr-example-label">Live example — 142 Oak Ridge Dr, Atlanta GA</p>
            <div className="dscr-example-grid">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="dscr-example-stat-label">{stat.label}</p>
                  <p className="dscr-example-stat-value">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ol className="dscr-steps">
          {STEPS.map((step, i) => {
            const isActive = active === i;
            return (
              <li key={step.title}>
                <button
                  type="button"
                  className={`dscr-step-num${isActive ? " is-active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-current={isActive ? "step" : undefined}
                >
                  {i + 1}
                </button>
                <div className="dscr-step-copy">
                  <p className="dscr-step-time">{step.time}</p>
                  <h3 className={isActive ? "is-active" : undefined}>{step.title}</h3>
                  {isActive ? <p>{step.body}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
