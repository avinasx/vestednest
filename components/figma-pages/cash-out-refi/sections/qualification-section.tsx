/* eslint-disable @next/next/no-img-element */
import { imgCancel01, imgTick02 } from "@/lib/figma/assets";
import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(cashOutRefiPage, "qualification");

export function CorQualificationSection() {
  return (
    <section className="cor-section cor-section--cream">
      <div className="cor-inner cor-text-center">
        <SectionHeader label={section.label} title={section.title} />
      </div>
      <div className="cor-inner cor-qual-grid">
        <div className="cor-qual-panel cor-qual-panel--yes">
          <div className="cor-qual-panel-head">What we look at</div>
          <ul className="cor-qual-list">
            {section.yes.map((item) => (
              <li key={item.title}>
                <img src={imgTick02} alt="" aria-hidden />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="cor-qual-panel cor-qual-panel--no">
          <div className="cor-qual-panel-head cor-qual-panel-head--muted">What we don&apos;t</div>
          <ul className="cor-qual-list">
            {section.no.map((item) => (
              <li key={item.title}>
                <img src={imgCancel01} alt="" aria-hidden />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
