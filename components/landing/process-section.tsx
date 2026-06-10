/* eslint-disable @next/next/no-img-element */
import { SectionLabel } from "./section-label";

const STEPS = [
  {
    n: "1",
    time: "45 seconds",
    title: "Drop the address.",
    body: "We pull the parcel, rent comps, and rent roll automatically via Rentcast. Five fields total. Our AI reads the property so you don't have to.",
    active: true,
  },
  { n: "2", time: "90 seconds", title: "See the math.", body: "", active: false },
  { n: "3", time: "SAME SESSION", title: "Keys. Wire. Done.", body: "", active: false },
  { n: "4", time: "Days 1–7", title: "We take it from here.", body: "", active: false },
  { n: "5", time: "Day 14", title: "Close.", body: "", active: false },
];

const CARD_CHECKS = [
  "Parcel data pulled",
  "Rent comps loaded (Rentcast)",
  "Market trend checked",
  "DSCR calculated",
];

export function ProcessSection() {
  return (
    <section className="landing-process-section">
      <img src="/landing/process-bg.png" alt="" className="landing-process-bg" aria-hidden />
      <div className="landing-section-inner">
        <div className="landing-process">
          <div>
            <SectionLabel>Process</SectionLabel>
            <h2 className="landing-process-title">
              Five steps.
              <br />
              <span className="landing-serif">No surprises.</span>
            </h2>
            <p className="landing-process-lead">
              The same process for a $200K single-family and a $5M small balance multi. Faster than
              a conventional pre-approval.
            </p>
            <div className="landing-process-card">
              <span className="corner" aria-hidden />
              <p className="landing-process-card-step">Step 01 · 45 seconds</p>
              <h3>Drop the address.</h3>
              <div className="landing-process-card-pill">
                <img src="/landing/icon-location.svg" alt="" aria-hidden />
                142 Oak Ridge Dr, Atlanta GA 30315
              </div>
              <div className="landing-process-card-checks">
                {CARD_CHECKS.map((check) => (
                  <span key={check}>
                    <img src="/landing/icon-tick.svg" alt="" aria-hidden />
                    {check}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ol className="landing-process-steps">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className={`landing-process-step${step.active ? " landing-process-step--active" : ""}`}
              >
                <div className="landing-process-num">
                  <span>{step.n}</span>
                </div>
                <div>
                  <p className="landing-process-time">{step.time}</p>
                  <h3>{step.title}</h3>
                  {step.body ? <p>{step.body}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
