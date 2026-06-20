import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(rentalLoansPage, "pipeline");
if (!section || section.type !== "pipeline") throw new Error("Rental pipeline missing");

export function RlPipelineSection() {
  return (
    <section className="rl-section rl-section--cream">
      <div className="rl-inner rl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              Real rental deals. <em>All property types.</em>
            </>
          }
        />
      </div>
      <div className="rl-inner rl-pipeline-grid">
        {section.deals.map((deal, index) => (
          <article
            key={deal.city}
            className={index === 0 ? "rl-pipeline-card rl-pipeline-card--featured" : "rl-pipeline-card"}
          >
            <p className="rl-pipeline-tag">{deal.tag}</p>
            <h3>{deal.city}</h3>
            {deal.amount ? <p className="rl-pipeline-amount">{deal.amount}</p> : null}
            <p className="rl-pipeline-caption">{deal.caption}</p>
            <div className="rl-pipeline-stats">
              {deal.stats.map((stat) => (
                <div key={stat.label} className="rl-pipeline-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
