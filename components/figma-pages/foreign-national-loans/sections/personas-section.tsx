import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(foreignNationalLoansPage, "personas");
if (!section || section.type !== "personas") throw new Error("Foreign national personas missing");

export function FnlPersonasSection() {
  return (
    <section className="fnl-section fnl-section--white">
      <div className="fnl-inner fnl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              Three types of international investors. <em>One product.</em>
            </>
          }
          lead={section.lead}
        />
      </div>
      <div className="fnl-inner fnl-personas-grid">
        {section.items.map((item) => (
          <article key={item.title} className="fnl-persona-card">
            <p className="fnl-persona-label">{item.title}</p>
            <h3>{item.subtitle}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
