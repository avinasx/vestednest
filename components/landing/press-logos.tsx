const LOGOS = [
  { name: "NATIONAL MORTGAGE NEWS", style: { fontWeight: 800, letterSpacing: "0.5px" } },
  { name: "HousingWire", style: { fontWeight: 700, fontStyle: "italic" as const } },
  { name: "Forbes", style: { fontFamily: "Georgia, serif", fontWeight: 700 } },
  { name: "BiggerPockets", style: { fontWeight: 800 } },
  { name: "TechCrunch", style: { fontWeight: 900, letterSpacing: "-0.5px" } },
];

export function PressLogos() {
  return (
    <section className="landing-press" aria-label="Press logos">
      <div className="landing-press-inner">
        {LOGOS.map((logo) => (
          <span key={logo.name} className="landing-press-logo" style={logo.style}>
            {logo.name}
          </span>
        ))}
      </div>
    </section>
  );
}
