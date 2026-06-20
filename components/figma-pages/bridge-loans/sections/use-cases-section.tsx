/* eslint-disable @next/next/no-img-element */
import { imgCheckmarkCircle3 } from "@/lib/figma/assets";
import { BRIDGE_USE_CASES } from "../content";
import { SectionHeader } from "../section-header";

export function BridgeUseCasesSection() {
  return (
    <section className="bl-section bl-section--page">
      <div className="bl-inner bl-text-center">
        <SectionHeader
          label="Use cases"
          title={
            <>
              Two strategies. <em>One product.</em>
            </>
          }
        />
      </div>
      <div className="bl-inner bl-use-cases-grid">
        {BRIDGE_USE_CASES.map((item) => (
          <article key={item.tag} className="bl-use-case-card">
            <p className="bl-use-case-tag">{item.tag}</p>
            <h3>{item.title}</h3>
            <p className="bl-use-case-body">{item.body}</p>
            <div className="bl-deal-math">
              <p className="bl-deal-math-label">Sample deal math</p>
              <dl>
                {item.math.map((row) => (
                  <div key={row.label} className={row.highlight ? "bl-deal-row bl-deal-row--highlight" : "bl-deal-row"}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ul className="bl-use-case-perks">
              {item.perks.map((perk) => (
                <li key={perk}>
                  <img src={imgCheckmarkCircle3} alt="" aria-hidden />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
