import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(foreignNationalLoansPage, "pipeline");
if (!section || section.type !== "pipeline") throw new Error("Foreign national pipeline missing");

export function FnlPipelineSection() {
  return (
    <section className="fnl-section fnl-section--cream">
      <div className="fnl-inner fnl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              Real foreign national <em>deals.</em>
            </>
          }
        />
      </div>
      <div className="fnl-inner fnl-pipeline-grid">
        {section.deals.map((deal, index) => (
          <article
            key={deal.city}
            className={index === 0 ? "fnl-pipeline-card fnl-pipeline-card--featured" : "fnl-pipeline-card"}
          >
            <p className="fnl-pipeline-tag">{deal.tag}</p>
            <h3>{deal.city}</h3>
            {deal.amount ? <p className="fnl-pipeline-amount">{deal.amount}</p> : null}
            <p className="fnl-pipeline-caption">{deal.caption}</p>
            <div className="fnl-pipeline-stats">
              {deal.stats.map((stat) => (
                <div key={stat.label} className="fnl-pipeline-stat">
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
