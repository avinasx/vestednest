import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { SectionHeader } from "../section-header";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(rentalLoansPage, "journey");
if (!section || section.type !== "journey") throw new Error("Rental journey missing");

export function RlJourneySection() {
  return (
    <section className="rl-section rl-section--white">
      <div className="rl-inner rl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              Built for the whole journey. <em>Not just deal one.</em>
            </>
          }
          lead={section.lead}
        />
      </div>
      <div className="rl-inner rl-journey-wrap">
        <ol className="rl-journey-steps">
          {section.steps.map((step, index) => (
            <li key={step.title} className={index >= 2 ? "rl-journey-step rl-journey-step--active" : "rl-journey-step"}>
              <span className="rl-journey-num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
