/* eslint-disable @next/next/no-img-element */

const LOGOS = [
  { src: "/landing/press/biggerpockets.png", alt: "BiggerPockets" },
  { src: "/landing/press/bloomberg.png", alt: "Bloomberg" },
  { src: "/landing/press/inman.png", alt: "Inman" },
  { src: "/landing/press/housingwire.png", alt: "HousingWire" },
  { src: "/landing/press/therealdeal.png", alt: "The Real Deal" },
];

export function PressLogos() {
  return (
    <section className="landing-press" aria-label="Press logos">
      <div className="landing-press-inner">
        {LOGOS.map((logo) => (
          <img key={logo.alt} src={logo.src} alt={logo.alt} className="landing-press-logo-img" />
        ))}
      </div>
    </section>
  );
}
