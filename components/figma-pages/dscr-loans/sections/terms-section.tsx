import { dscrLoansPage } from "@/lib/product-pages/content/dscr-loans";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const termsSection = getPageSection(dscrLoansPage, "terms");
if (!termsSection || termsSection.type !== "terms") {
  throw new Error("DSCR terms section missing");
}

export function DscrTermsSection() {
  return (
    <section className="dscr-terms">
      <div className="dscr-inner dscr-terms-head">
        <div className="dscr-label">
          <span className="dscr-label-dot" aria-hidden />
          {termsSection.label}
        </div>
        <h2 className="dscr-section-title">
          Rates &amp; <em>terms.</em>
        </h2>
        {termsSection.lead ? <p className="dscr-section-lead">{termsSection.lead}</p> : null}
      </div>
      <div className="dscr-inner">
        <div className="dscr-table-wrap">
          <table className="dscr-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Range / Options</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {termsSection.rows.map((row) => (
                <tr key={row.param}>
                  <td>{row.param}</td>
                  <td>{row.range}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {termsSection.footnote ? <p className="dscr-table-footnote">{termsSection.footnote}</p> : null}
      </div>
    </section>
  );
}
