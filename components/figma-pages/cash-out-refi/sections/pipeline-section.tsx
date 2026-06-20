import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { SectionHeader } from "../section-header";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(cashOutRefiPage, "pipeline");
if (!section || section.type !== "pipeline") throw new Error("Cash-out pipeline missing");

export function CorPipelineSection() {
  return (
    <section className="cor-section cor-section--white">
      <div className="cor-inner cor-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              Real cash-out <em>deals.</em>
            </>
          }
        />
      </div>
      <div className="cor-inner cor-pipeline-grid">
        {section.deals.map((deal) => (
          <article key={deal.city} className="cor-pipeline-card">
            <p className="cor-pipeline-tag">{deal.tag}</p>
            <h3>{deal.city}</h3>
            {deal.amount ? <p className="cor-pipeline-amount">{deal.amount}</p> : null}
            <p className="cor-pipeline-caption">{deal.caption}</p>
            <div className="cor-pipeline-stats">
              {deal.stats.map((stat) => (
                <div key={stat.label} className="cor-pipeline-stat">
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
