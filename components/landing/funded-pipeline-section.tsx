"use client";

import { useState } from "react";
import { SectionLabel } from "./section-label";

const TABS = ["All", "Bridge → DSCR", "Cash-Out", "BIFI"];

const DEALS = [
  {
    tag: "Bridge → DSCR",
    filters: ["Bridge → DSCR", "Cash-Out"],
    city: "Atlanta, GA",
    amount: "$990K @ 7.99%",
    caption: "Refi out of 12% bridge after 31 days. Cash-out at close.",
    stats: [
      { label: "ARV", value: "$936.7K" },
      { label: "Saved on bridge", value: "$4,074" },
    ],
    featured: false,
  },
  {
    tag: "DSCR Purchase",
    filters: [],
    city: "Phoenix, AZ",
    amount: "",
    caption: "",
    stats: [
      { label: "LTV", value: "75%" },
      { label: "DSCR", value: "1.34x" },
      { label: "Term", value: "30yr fixed" },
      { label: "Closed in", value: "13 days" },
    ],
    featured: true,
  },
  {
    tag: "DSCR + BIFI",
    filters: ["BIFI"],
    city: "Nashville, TN",
    amount: "$972K @ 7.5%",
    caption: "5-door portfolio refinance, blanket DSCR + BIFI add-on.",
    stats: [
      { label: "5-unit cash flow", value: "$425/mo" },
      { label: "DSCR", value: "1.32x" },
    ],
    featured: false,
  },
  {
    tag: "DSCR Purchase",
    filters: [],
    city: "Tampa, FL",
    amount: "$415K @ 7.75%",
    caption: "New build SFR — funded under target close.",
    stats: [
      { label: "DSCR", value: "1.28x" },
      { label: "Days to close", value: "13" },
    ],
    featured: false,
  },
];

export function FundedPipelineSection() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <section className="landing-pipeline">
      <div className="landing-section-inner">
        <div className="text-center">
          <SectionLabel>Funded pipeline</SectionLabel>
          <h2 className="landing-section-title">
            Real deals. <span className="accent-bold">Real terms.</span>
          </h2>
          <p className="landing-section-lead">
            Don&apos;t take our word for it. Here&apos;s what we actually funded this month.
            Anonymized so you can see the math.
          </p>
          <div className="landing-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`landing-tab${tab === activeTab ? " landing-tab--active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="landing-deal-grid">
          {DEALS.map((deal) => {
            const isHighlighted = activeTab === "All" ? deal.featured : deal.filters.includes(activeTab);
            return (
              <article
                key={`${deal.city}-${deal.tag}`}
                className={`landing-deal-card${isHighlighted ? " landing-deal-card--featured" : ""}`}
              >
              <p className="landing-deal-tag">{deal.tag}</p>
              <p className="landing-deal-city">{deal.city}</p>
              {deal.amount ? (
                <>
                  <p className="landing-deal-amount-label">Loan amount</p>
                  <p className="landing-deal-amount">{deal.amount}</p>
                </>
              ) : null}
              <div className="landing-deal-stats">
                {deal.stats.map((stat) => (
                  <div key={stat.label} className="landing-deal-stat">
                    <p className="landing-deal-stat-label">{stat.label}</p>
                    <p className="landing-deal-stat-value">{stat.value}</p>
                  </div>
                ))}
              </div>
              {deal.featured ? (
                <button type="button" className="landing-deal-link">
                  Download term sheet PDF
                </button>
              ) : (
                <p className="landing-deal-caption">{deal.caption}</p>
              )}
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
