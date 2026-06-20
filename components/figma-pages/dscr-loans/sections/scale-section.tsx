/* eslint-disable @next/next/no-img-element */

const PARAGRAPHS = [
  "DSCR stands for Debt Service Coverage Ratio. It's the number that tells a lender whether a rental property can pay for itself.",
  "The formula is simple: Monthly Rent ÷ Monthly PITIA. If the property earns more than it costs, it qualifies — regardless of who owns it, what they earn, or what their W2 says.",
  "Because DSCR loans are business-purpose loans made to entities (your LLC), they sit outside the consumer mortgage rulebook. No TRID. No RESPA. No DTI. That's how we can quote your rate on screen in 60 seconds.",
];

const SCALE = [
  {
    value: "1.32x",
    tag: "Strong",
    color: "#25933e",
    body: "Property earns well above its cost. Qualifies easily.",
  },
  {
    value: "1.10x",
    tag: "Qualifying",
    color: "#e18220",
    body: "Above 1.1x — eligible. Rate may be slightly higher.",
  },
  {
    value: "1.00x",
    tag: "Borderline",
    color: "#258493",
    body: "Break-even. No-Ratio option may apply.",
  },
  {
    value: "0.85x",
    tag: "Below 1.0x",
    color: "#ff6359",
    body: "Property costs more than it earns. No-Ratio or STR income considered.",
  },
];

export function DscrScaleSection() {
  return (
    <section className="dscr-scale">
      <div className="dscr-inner dscr-scale-top">
        <div className="dscr-scale-copy">
          <div className="dscr-label">
            <span className="dscr-label-dot" aria-hidden />
            The DSCR scale
          </div>
          <h2 className="dscr-scale-title">
            What is a <em>DSCR loan?</em>
          </h2>
          {PARAGRAPHS.map((p) => (
            <p key={p} className="dscr-scale-p">
              {p}
            </p>
          ))}
        </div>
        <div className="dscr-scale-art">
          <img src="/figma-assets/imgImage10788.png" alt="" className="dscr-scale-illustration" />
        </div>
      </div>
      <div className="dscr-inner dscr-scale-metrics">
        {SCALE.map((item, i) => (
          <div key={item.value} className="dscr-scale-metric">
            {i > 0 ? <span className="dscr-scale-divider" aria-hidden /> : null}
            <p className="dscr-scale-value" style={{ color: item.color }}>
              {item.value}
            </p>
            <span className="dscr-scale-tag">{item.tag}</span>
            <p className="dscr-scale-body">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
