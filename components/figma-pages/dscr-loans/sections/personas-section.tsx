/* eslint-disable @next/next/no-img-element */

const PERSONAS = [
  {
    icon: "/figma-assets/imgSaveMoneyDollar.svg",
    label: "LLC Investor",
    title: "Buying through an entity, protecting assets",
    body: "Owns three SFRs through a Delaware LLC. Great cash flow, thin W2. Every conventional lender has said no — not because the deals are bad, but because the system isn't built for them.",
  },
  {
    icon: "/figma-assets/imgAspectRatio.svg",
    label: "Portfolio Builder",
    title: "Scaling past the 10-loan conventional ceiling",
    body: "Hit the Fannie Mae 10-loan limit two years ago. Has been buying cash, needing a DSCR lender who can underwrite deal 11, 12, and 20 with no personal income check.",
  },
  {
    icon: "/figma-assets/imgMarketing.svg",
    label: "Out-of-state Buyer",
    title: "Buying in markets they don't live in",
    body: "Based in California, buying in Georgia and Florida for the cash flow. Needs a lender who doesn't require them to bank locally, appear in person, or explain their rental income on a form.",
  },
];

export function DscrPersonasSection() {
  return (
    <section className="dscr-personas">
      <div className="dscr-inner dscr-personas-head">
        <div className="dscr-label">
          <span className="dscr-label-dot" aria-hidden />
          Who it&apos;s for
        </div>
        <h2 className="dscr-section-title">
          Built for serious <em>operators.</em>
        </h2>
        <p className="dscr-section-lead">
          Not your first home. Not a weekend cabin. This product exists for people who own rental
          properties through entities and need capital that keeps up with them.
        </p>
      </div>
      <div className="dscr-inner dscr-personas-grid">
        {PERSONAS.map((item) => (
          <article key={item.label} className="dscr-persona-card">
            <img src={item.icon} alt="" aria-hidden className="dscr-persona-icon" />
            <p className="dscr-persona-label">{item.label}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
