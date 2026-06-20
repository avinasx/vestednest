import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { SectionHeader } from "../section-header";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(cashOutRefiPage, "terms");
if (!section || section.type !== "terms") throw new Error("Cash-out terms missing");

export function CorTermsSection() {
  return (
    <section className="cor-section cor-section--muted">
      <div className="cor-inner cor-text-center">
        <SectionHeader label={section.label} title={section.title} lead={section.lead} />
      </div>
      <div className="cor-inner cor-table-wrap">
        <table className="cor-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Range / Options</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row) => (
              <tr key={row.param}>
                <td>{row.param}</td>
                <td>{row.range}</td>
                <td>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
