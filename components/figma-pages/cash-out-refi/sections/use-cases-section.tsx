/* eslint-disable @next/next/no-img-element */
import { imgIcComplete02HandoffsBg3 } from "@/lib/figma/assets";
import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { SectionHeader } from "../section-header";
import { findPageSection } from "@/lib/product-pages/get-section";

const section = findPageSection(cashOutRefiPage, "cards", (s) => s.label === "Use cases");

export function CorUseCasesSection() {
  return (
    <section className="cor-section cor-section--muted cor-use-cases">
      <img src={imgIcComplete02HandoffsBg3} alt="" aria-hidden className="cor-use-cases-bg" />
      <div className="cor-inner cor-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              What operators use <em>cash-out for.</em>
            </>
          }
          lead={section.lead}
        />
      </div>
      <div className="cor-inner cor-cards-grid cor-cards-grid--4">
        {section.items.map((item) => (
          <article key={item.title} className="cor-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
