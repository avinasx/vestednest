import { SectionLabel } from "./section-label";
import { HeroAiBar } from "./hero-ai-bar";

const MINI_STATS = [
  { value: "60s", label: "to a term sheet" },
  { value: "14 days", label: "median close" },
  { value: "0", label: "W2s required" },
];

type NestAiSectionProps = {
  heroInput: string;
  heroState: string;
  classicMode: boolean;
  onHeroInputChange: (value: string) => void;
  onHeroStateChange: (state: string) => void;
  onClassicModeChange: (value: boolean) => void;
  onStart: (text?: string) => void;
};

export function NestAiSection(props: NestAiSectionProps) {
  return (
    <section className="landing-nestai">
      <div className="landing-nestai-head">
        <SectionLabel>Powered by Nest AI</SectionLabel>
        <h2>
          Drop an address.
          <br />
          <span className="accent">We do the rest.</span>
        </h2>
        <p className="landing-nestai-lead">
          We pull the rent comps from Rentcast, run the DSCR math, and put your rate on screen — in
          60 seconds. No W2. No DTI. No waiting. Just the math, your rate, and a funder who picks up
          the phone.
        </p>
        <div className="landing-mini-stats">
          {MINI_STATS.map((stat) => (
            <div key={stat.label} className="landing-mini-stat">
              <p className="landing-mini-stat-value">{stat.value}</p>
              <p className="landing-mini-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <HeroAiBar {...props} />
    </section>
  );
}
