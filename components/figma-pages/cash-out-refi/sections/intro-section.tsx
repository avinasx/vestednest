import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const intro = getPageSection(cashOutRefiPage, "intro");
const example = getPageSection(cashOutRefiPage, "worked-example");

export function CorIntroSection() {
  return (
    <section className="cor-section cor-section--white">
      <div className="cor-inner cor-intro-grid">
        <div className="cor-intro-copy">
          <SectionHeader
            align="left"
            label={intro.label}
            title={
              <>
                Turn equity into capital. <em>Without touching your W2.</em>
              </>
            }
          />
          {intro.paragraphs.map((p) => (
            <p key={p} className="cor-body">
              {p}
            </p>
          ))}
        </div>

        <div className="cor-example-panel">
          <p className="cor-example-label">{example.label}</p>
          <h3 className="cor-example-title">{example.title}</h3>
          <dl className="cor-example-rows">
            {example.rows.map((row) => (
              <div
                key={row.label}
                className={row.highlight ? "cor-example-row cor-example-row--highlight" : "cor-example-row"}
              >
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="cor-example-stats">
            {example.stats.map((stat) => (
              <div key={stat.label} className="cor-example-stat">
                <span className="cor-example-stat-label">{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
