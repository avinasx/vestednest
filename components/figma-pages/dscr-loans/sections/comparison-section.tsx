/* eslint-disable @next/next/no-img-element */
import { imgCancel01, imgTick01 } from "@/lib/figma/assets";
import { dscrLoansPage } from "@/lib/product-pages/content/dscr-loans";
import { getPageSection } from "@/lib/product-pages/get-section";

const comparisonSection = getPageSection(dscrLoansPage, "comparison");
if (!comparisonSection || comparisonSection.type !== "comparison") {
  throw new Error("DSCR comparison section missing");
}

export function DscrComparisonSection() {
  return (
    <section className="dscr-comparison">
      <div className="dscr-inner dscr-comparison-head">
        <div className="dscr-label">
          <span className="dscr-label-dot" aria-hidden />
          {comparisonSection.label}
        </div>
        <h2 className="dscr-section-title">{comparisonSection.title}</h2>
      </div>
      <div className="dscr-inner">
        <div className="dscr-comparison-table">
          <div className="dscr-comparison-colheads">
            <div className="dscr-comparison-colhead dscr-comparison-colhead--feature" aria-hidden />
            <div className="dscr-comparison-colhead dscr-comparison-colhead--dscr">DSCR</div>
            <div className="dscr-comparison-gap" aria-hidden />
            <div className="dscr-comparison-colhead dscr-comparison-colhead--conv">
              Conventional Mortgage
            </div>
          </div>
          <div className="dscr-comparison-shell">
            <div className="dscr-comparison-body">
              {comparisonSection.rows.map((row, index) => (
                <div
                  key={row.feature}
                  className={`dscr-comparison-row${index % 2 === 1 ? " dscr-comparison-row--alt" : ""}`}
                >
                  <div className="dscr-comparison-feature">{row.feature}</div>
                  <div className="dscr-comparison-val dscr-comparison-val--dscr">
                    <img src={imgTick01} alt="" aria-hidden />
                    <span>{row.dscr}</span>
                  </div>
                  <div className="dscr-comparison-val dscr-comparison-val--conv">
                    <img src={imgCancel01} alt="" aria-hidden />
                    <span>{row.conventional}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
