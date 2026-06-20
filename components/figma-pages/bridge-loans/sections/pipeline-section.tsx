/* eslint-disable @next/next/no-img-element */
import { BRIDGE_PIPELINE } from "../content";
import { SectionHeader } from "../section-header";

export function BridgePipelineSection() {
  return (
    <section className="bl-section bl-section--cream">
      <div className="bl-inner bl-text-center">
        <SectionHeader
          label="Funded pipeline"
          title={
            <>
              Real bridge <em>deals.</em>
            </>
          }
        />
      </div>
      <div className="bl-inner bl-pipeline-grid">
        {BRIDGE_PIPELINE.map((deal) => (
          <article
            key={deal.city}
            className={deal.featured ? "bl-pipeline-card bl-pipeline-card--featured" : "bl-pipeline-card"}
          >
            <p className="bl-pipeline-tag">{deal.tag}</p>
            <h3>{deal.city}</h3>
            <p className="bl-pipeline-meta">Loan amount</p>
            <p className="bl-pipeline-amount">{deal.amount}</p>
            <div className="bl-pipeline-stats">
              {deal.stats.map((stat) => (
                <div key={stat.label} className="bl-pipeline-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
            <p className="bl-pipeline-caption">{deal.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
