/* eslint-disable @next/next/no-img-element */
import { CheckItem } from "./check-item";

type FinalCtaSectionProps = {
  onStart: () => void;
};

const PERKS = ["No W2", "No DTI", "No hard pull", "14-day close"];

export function FinalCtaSection({ onStart }: FinalCtaSectionProps) {
  return (
    <section className="landing-final-cta">
      <div className="landing-section-inner">
        <h2>
          Drop the address. <em>We&apos;ll do the rest</em>
        </h2>
        <p className="landing-final-cta-lead">
          Sixty seconds to a real indicative term sheet. Fourteen days to a closed loan.{" "}
          <strong>The property does the qualifying.</strong>
        </p>
        <button type="button" onClick={onStart} className="landing-final-cta-btn">
          Start with an address
          <img src="/landing/icon-arrow-right.svg" alt="" aria-hidden />
        </button>
        <div className="landing-final-cta-perks">
          {PERKS.map((perk) => (
            <CheckItem key={perk} light>
              {perk}
            </CheckItem>
          ))}
        </div>
      </div>
    </section>
  );
}
