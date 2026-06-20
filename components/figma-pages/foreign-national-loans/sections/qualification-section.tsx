/* eslint-disable @next/next/no-img-element */
import {
  imgCancel01,
  imgImage10790,
  imgImage10791,
  imgImage10792,
  imgImage10793,
  imgImage10794,
  imgImage10795,
  imgImage10796,
  imgImage10797,
  imgImage10798,
  imgImage10799,
  imgImage10800,
  imgImage10801,
  imgImage10802,
  imgImage10803,
  imgTick02,
  imgTick3,
} from "@/lib/figma/assets";
import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(foreignNationalLoansPage, "qualification");
if (!section || section.type !== "qualification") throw new Error("Foreign national qualification missing");

const FLAG_IMAGES = [
  imgImage10790,
  imgImage10791,
  imgImage10792,
  imgImage10793,
  imgImage10794,
  imgImage10795,
  imgImage10796,
  imgImage10797,
  imgImage10798,
  imgImage10799,
  imgImage10800,
  imgImage10801,
  imgImage10802,
  imgImage10803,
];

export function FnlQualificationSection() {
  return (
    <section className="fnl-section fnl-section--cream">
      <div className="fnl-inner fnl-text-center">
        <SectionHeader
          label={section.label}
          title={
            <>
              No SSN. No U.S. credit.
              <br />
              <em>Here&apos;s what you do need.</em>
            </>
          }
        />
      </div>
      <div className="fnl-inner fnl-qual-grid">
        <div className="fnl-qual-panel fnl-qual-panel--yes">
          <div className="fnl-qual-panel-head">What you need</div>
          <ul className="fnl-qual-list">
            {section.yes.map((item, i) => (
              <li key={item.title}>
                <img src={i === 0 ? imgTick02 : imgTick3} alt="" aria-hidden />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="fnl-qual-panel fnl-qual-panel--no">
          <div className="fnl-qual-panel-head fnl-qual-panel-head--muted">What you don&apos;t need</div>
          <ul className="fnl-qual-list">
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
      <div className="fnl-inner fnl-qual-flags">
        <span>We serve investors from</span>
        <div className="fnl-qual-flag-row">
          {FLAG_IMAGES.map((src) => (
            <img key={src} src={src} alt="" aria-hidden />
          ))}
        </div>
        <span>and many more...</span>
      </div>
    </section>
  );
}
