/* eslint-disable @next/next/no-img-element */
import { PressLogos } from "./press-logos";

const STATS = [
  { value: "$1.4B+", label: "Funded Since 2019" },
  { value: "4.9/5", label: "Operator NPS" },
  { value: "14 days", label: "Median Close" },
  { value: "38", label: "States Funded" },
];

type HeroSectionProps = {
  onStart: () => void;
};

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <>
      <section className="landing-hero">
        <div className="landing-hero-grid" aria-hidden />
        <div className="landing-hero-cells" aria-hidden />
        <div className="landing-hero-glow" aria-hidden />
        <div className="landing-hero-inner">
          <div className="landing-hero-badge">America&apos;s first agentic DSCR lender</div>
          <h1 suppressHydrationWarning>
            Most lenders <strong>qualify you</strong>.<br />
            We qualify the <span className="accent">property.</span>
          </h1>
          <p className="landing-hero-lead">
            Drop a property address — our AI reads the rent comps, runs the DSCR math, and puts
            your rate on screen in 60 seconds. No W2. No DTI. No 30-day forms.
          </p>
          <div className="landing-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="landing-stat">
                <p className="landing-stat-value">{stat.value}</p>
                <p className="landing-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
          <span className="landing-hero-bird" aria-hidden />
          <div>
            <button type="button" className="landing-fly-cta" onClick={onStart}>
              Close it on the Fly!
              <svg viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 13 13 3M6 3h7v7"
                  stroke="#24933e"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
      <PressLogos />
    </>
  );
}
