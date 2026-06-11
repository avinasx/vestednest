"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionLabel } from "./section-label";

const STEPS = [
  {
    n: "1",
    time: "45 seconds",
    title: "Drop the address.",
    body: "We pull the parcel, rent comps, and rent roll automatically via Rentcast. Five fields total. Our AI reads the property so you don't have to.",
  },
  {
    n: "2",
    time: "90 seconds",
    title: "See the math.",
    body: "Rate, points, payment, and DSCR ratio render on screen — no email gate. Adjust the levers and watch the term sheet update live.",
  },
  {
    n: "3",
    time: "Same session",
    title: "Keys. Wire. Done.",
    body: "Download your indicative term sheet as a PDF — same session, no account, no email gate. Ready to send to your seller or partner.",
  },
  {
    n: "4",
    time: "Days 1–7",
    title: "We take it from here.",
    body: "Light borrower docs only. We schedule the appraisal and underwrite in parallel — never sequentially. Bridge appraisal reused where allowed.",
  },
  {
    n: "5",
    time: "Day 14",
    title: "Close.",
    body: "Wire instructions issued. Median close is 14 calendar days from first address drop. That's 31 fewer days than conventional — $3K–$8K back in your pocket per $500K of loan.",
  },
] as const;

/** Scroll segments: initial → process 1–5 → return to initial */
const SCROLL_SEGMENTS = 7;

const CARD_CHECKS = [
  "Parcel data pulled",
  "Rent comps loaded (Rentcast)",
  "Market trend checked",
  "DSCR calculated",
];

const DOCS_REQUIRED = [
  "Entity docs (LLC / trust)",
  "3 months bank statements",
  "Insurance binder",
];

const DOCS_NOT_REQUIRED = ["No W2, no tax returns", "No employment verification"];

const CLOSE_CHECKS = [
  "Wire instructions issued.",
  "31 fewer days than conventional.",
  "$3K–$8K saved per $500K.",
];

function segmentToActiveStep(segment: number) {
  if (segment === 0 || segment >= SCROLL_SEGMENTS - 1) return 1;
  return segment;
}

function segmentToCardStep(segment: number) {
  if (segment === 0 || segment >= SCROLL_SEGMENTS - 1) return 1;
  return segment;
}

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

function getViewportHeight(scrollParent: HTMLElement | Window) {
  return scrollParent === window
    ? window.innerHeight
    : (scrollParent as HTMLElement).clientHeight;
}

function ProcessCardPanel({ cardStep, visible }: { cardStep: number; visible: boolean }) {
  return (
    <div
      className={`landing-process-card-panel${visible ? " landing-process-card-panel--visible" : ""}`}
      aria-hidden={!visible}
    >
      {cardStep === 1 && (
        <>
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
        </>
      )}

      {cardStep === 2 && (
        <>
          <p className="landing-process-card-step">Step 02 · 90 seconds</p>
          <h3>See the math.</h3>
          <div className="landing-process-card-stats">
            <div>
              <p className="landing-process-card-stat-label">Rate</p>
              <p className="landing-process-card-stat-value">7.99%</p>
            </div>
            <div>
              <p className="landing-process-card-stat-label">DSCR</p>
              <p className="landing-process-card-stat-value">1.32x</p>
            </div>
            <div>
              <p className="landing-process-card-stat-label">PITIA</p>
              <p className="landing-process-card-stat-value">$1,773</p>
            </div>
            <div>
              <p className="landing-process-card-stat-label">Cash to close</p>
              <p className="landing-process-card-stat-value">$96K</p>
            </div>
          </div>
        </>
      )}

      {cardStep === 3 && (
        <>
          <p className="landing-process-card-step">Step 03 · Same session</p>
          <h3>Download the term sheet.</h3>
          <div className="landing-process-card-sheet">
            <p className="landing-process-card-sheet-address">
              <img src="/landing/icon-location.svg" alt="" aria-hidden />
              142 Oak Ridge Dr, Atlanta GA
            </p>
            <div className="landing-process-card-sheet-tags">
              <span>Rate 7.99%</span>
              <span>DSCR 1.32x</span>
              <span>Close in 14 days</span>
            </div>
          </div>
          <p className="landing-process-card-footnote">
            No account needed. No email gate. Download instantly.
          </p>
        </>
      )}

      {cardStep === 4 && (
        <>
          <p className="landing-process-card-step">Step 04 · Days 1–7</p>
          <h3>We take it from here.</h3>
          <ul className="landing-process-card-docs">
            {DOCS_REQUIRED.map((item) => (
              <li key={item}>
                <img src="/landing/icon-tick.svg" alt="" aria-hidden />
                {item}
              </li>
            ))}
            {DOCS_NOT_REQUIRED.map((item) => (
              <li key={item} className="landing-process-card-docs--muted">
                <img src="/landing/icon-x.svg" alt="" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </>
      )}

      {cardStep === 5 && (
        <>
          <p className="landing-process-card-step">Step 05 · Day 14</p>
          <h3>Close.</h3>
          <div className="landing-process-card-close">
            <div className="landing-process-card-close-highlight">
              <p className="landing-process-card-close-days">14 Days</p>
              <p className="landing-process-card-close-caption">You&apos;re closed.</p>
            </div>
            <ul className="landing-process-card-close-list">
              {CLOSE_CHECKS.map((item) => (
                <li key={item}>
                  <img src="/landing/icon-tick.svg" alt="" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export function ProcessSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [segment, setSegment] = useState(0);

  const updateSegment = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollParent = getScrollParent(track);
    const viewportHeight = getViewportHeight(scrollParent);
    const rect = track.getBoundingClientRect();
    const scrollable = track.offsetHeight - viewportHeight;

    if (scrollable <= 0) {
      setSegment(0);
      return;
    }

    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = scrolled / scrollable;
    const next = Math.min(
      SCROLL_SEGMENTS - 1,
      Math.floor(progress * SCROLL_SEGMENTS),
    );
    setSegment(next);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollParent = getScrollParent(track);
    updateSegment();

    scrollParent.addEventListener("scroll", updateSegment, { passive: true });
    window.addEventListener("resize", updateSegment);

    return () => {
      scrollParent.removeEventListener("scroll", updateSegment);
      window.removeEventListener("resize", updateSegment);
    };
  }, [updateSegment]);

  const activeStep = segmentToActiveStep(segment);
  const cardStep = segmentToCardStep(segment);

  return (
    <section
      className="landing-process-section landing-process-scroll"
      aria-label="Process"
      style={{ ["--process-scroll-segments" as string]: SCROLL_SEGMENTS }}
    >
      <div ref={trackRef} className="landing-process-scroll-track">
        <div className="landing-process-scroll-sticky">
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
                  The same process for a $200K single-family and a $5M small balance multi. Faster
                  than a conventional pre-approval.
                </p>
                <div className="landing-process-card landing-process-card--animated">
                  <span className="corner" aria-hidden />
                  {[1, 2, 3, 4, 5].map((step) => (
                    <ProcessCardPanel key={step} cardStep={step} visible={cardStep === step} />
                  ))}
                </div>
              </div>
              <ol className="landing-process-steps">
                {STEPS.map((step) => {
                  const stepNum = Number(step.n);
                  const isActive = stepNum === activeStep;
                  return (
                    <li
                      key={step.n}
                      className={`landing-process-step${isActive ? " landing-process-step--active" : ""}`}
                    >
                      <div className="landing-process-num">
                        <span>{step.n}</span>
                      </div>
                      <div>
                        <p className="landing-process-time">{step.time}</p>
                        <h3>{step.title}</h3>
                        <p
                          className={`landing-process-step-body${isActive ? " landing-process-step-body--visible" : ""}`}
                        >
                          {step.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
