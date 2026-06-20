/* eslint-disable @next/next/no-img-element */
import { imgFile01, imgGlobal, imgHome13 } from "@/lib/figma/assets";
import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { SectionHeader } from "../section-header";
import { findPageSection } from "@/lib/product-pages/get-section";

const section = findPageSection(foreignNationalLoansPage, "cards", (s) => s.label === "The remote close");

const ICONS = [imgFile01, imgGlobal, imgHome13];

export function FnlRemoteCloseSection() {
  return (
    <section className="fnl-section fnl-section--white">
      <div className="fnl-inner fnl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              Close from anywhere. <em>No U.S. trip required.</em>
            </>
          }
        />
      </div>
      <div className="fnl-inner fnl-remote-grid">
        {section.items.map((item, index) => (
          <article key={item.title} className="fnl-remote-card">
            <div className="fnl-remote-icon">
              <img src={ICONS[index]} alt="" aria-hidden />
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
