/* eslint-disable @next/next/no-img-element */
import { imgLine3, imgTick02 } from "@/lib/figma/assets";
import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { SectionHeader } from "../section-header";
import { findPageSection, getPageSection } from "@/lib/product-pages/get-section";

const entitySection = findPageSection(rentalLoansPage, "cards", (s) => s.title.includes("LLC"));
const timelineSection = getPageSection(rentalLoansPage, "timeline");
if (!timelineSection || timelineSection.type !== "timeline") {
  throw new Error("Rental timeline missing");
}

export function RlEntitySection() {
  return (
    <section className="rl-section rl-section--muted rl-entity-section">
      <div className="rl-inner rl-entity-layout">
        <div className="rl-entity-copy">
          <SectionHeader
            align="left"
            label={entitySection.label}
            title={
              <>
                Own through an <em>LLC.</em>
              </>
            }
          />
          <h3 className="rl-entity-subtitle">{entitySection.lead}</h3>
          <div className="rl-entity-body">
            {entitySection.items.map((item) => (
              <p key={item.body.slice(0, 40)}>{item.body}</p>
            ))}
          </div>
        </div>

        <div className="rl-entity-timeline">
          <h3 className="rl-entity-timeline-heading">{timelineSection.title}</h3>
          <img src={imgLine3} alt="" aria-hidden className="rl-entity-timeline-line" />
          <ol className="rl-entity-timeline-steps">
            {timelineSection.steps.map((step) => (
              <li key={step.title}>
                <span className="rl-entity-timeline-num">{step.time}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
