import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { SectionHeader } from "../section-header";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(rentalLoansPage, "spectrum");
if (!section || section.type !== "spectrum") throw new Error("Rental spectrum missing");

export function RlSpectrumSection() {
  return (
    <section className="rl-section rl-section--muted">
      <div className="rl-inner rl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              SFR to small commercial. <em>One underwrite model.</em>
            </>
          }
        />
      </div>
      <div className="rl-inner rl-spectrum-grid">
        {section.items.map((item, index) => (
          <article key={item.tab} className="rl-spectrum-card">
            <div className={index === 0 ? "rl-spectrum-tab rl-spectrum-tab--active" : "rl-spectrum-tab"}>
              {item.tab}
            </div>
            <div className="rl-spectrum-body">
              <div className="rl-spectrum-intro">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <dl className="rl-spectrum-specs">
                {item.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className={
                      spec.label === "STR eligible"
                        ? "rl-spectrum-spec rl-spectrum-spec--highlight"
                        : "rl-spectrum-spec"
                    }
                  >
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
