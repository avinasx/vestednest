/* eslint-disable @next/next/no-img-element */
import { SectionLabel } from "./section-label";

const PROBLEMS = [
  {
    tag: "The Income Trap",
    title: "Your W2 shouldn't decide if a cash-flowing property gets funded.",
    body: "A rental pulling $3,200/mo with a 1.4x DSCR gets rejected because the borrower's personal income looks thin on paper.",
    icon: "/landing/icon-income-trap.svg",
  },
  {
    tag: "The Speed Problem",
    title: "A 45-day close kills deals. Sellers won't wait. Sellers take cash offers.",
    body: "Conventional purchase mortgages average 45 days from contract to close. In competitive markets, that's the same as not bidding at all. You lose before you start.",
    icon: "/landing/icon-speed.svg",
  },
  {
    tag: "The Opacity Problem",
    title: "Getting a rate quote shouldn't require a 30-day form and a hard pull.",
    body: "Every time you ask a lender what your rate would be, you're three weeks and a credit inquiry deep before you see a number.",
    icon: "/landing/icon-opacity.svg",
  },
];

export function OldWaySection() {
  return (
    <section className="landing-section bg-white">
      <div className="landing-section-inner">
        <div className="text-center">
          <SectionLabel>The Old Way is Broken</SectionLabel>
          <h2 className="landing-section-title">
            Conventional lenders weren&apos;t built for <strong>this.</strong>
          </h2>
          <p className="landing-section-lead">
            Real estate operators are analytical, move fast, and own through LLCs. The consumer
            mortgage system was designed for someone buying their first home in 1987.
          </p>
        </div>
        <div className="landing-card-grid">
          {PROBLEMS.map((problem) => (
            <article key={problem.tag} className="landing-card">
              <img src={problem.icon} alt="" className="landing-card-icon" aria-hidden />
              <p className="landing-card-tag">{problem.tag}</p>
              <h3>{problem.title}</h3>
              <p>{problem.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
