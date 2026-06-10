/* eslint-disable @next/next/no-img-element */
import { SectionLabel } from "./section-label";

const ROW_ONE = [
  {
    name: "Marcus T.",
    meta: "Atlanta, GA · 4-unit rental portfolio",
    quote:
      "I sent the address Monday morning. Had a term sheet by noon. Closed in 11 days. I've never seen anything like it.",
    avatar: "",
    muted: false,
  },
  {
    name: "Sandeep R.",
    meta: "Phoenix, AZ — Bridge → DSCR refinance",
    quote:
      "We were stuck in a 12% bridge burning $130 a day. Vested Nest got us out in 13 days. The math was brutal to ignore.",
    avatar: "/landing/avatar-sandeep.png",
    muted: false,
  },
  {
    name: "Jennifer L.",
    meta: "Nashville, TN — 5-door portfolio, BIFI add-on",
    quote:
      "No W2. No DTI. The LLC owned the property, the rental income covered everything. Exactly what a DSCR lender should be.",
    avatar: "/landing/avatar-jennifer.png",
    muted: false,
  },
];

const ROW_TWO = [
  {
    name: "Zara Q.",
    meta: "Tampa, FL — DSCR purchase, new build SFR",
    quote:
      "The rate was on my screen before my coffee got cold. Closed under target with zero re-papering.",
    avatar: "/landing/avatar-zara.png",
    muted: true,
  },
  {
    name: "Jennifer L.",
    meta: "Nashville, TN — 5-door portfolio, BIFI add-on",
    quote:
      "No W2. No DTI. The LLC owned the property, the rental income covered everything. Exactly what a DSCR lender should be.",
    avatar: "/landing/avatar-jennifer.png",
    muted: false,
  },
  {
    name: "L. Kim",
    meta: "Austin, TX — Cash-out refinance",
    quote:
      "Their AI read the rent comps better than my own analyst. Cash-out wired on day 14, exactly as quoted.",
    avatar: "/landing/avatar-lkim.png",
    muted: true,
  },
];

function TestimonialCard({
  t,
}: {
  t: { name: string; meta: string; quote: string; avatar: string; muted: boolean };
}) {
  const initials = t.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className={`landing-testimonial${t.muted ? " landing-testimonial--muted" : ""}`}>
      <div className="landing-testimonial-head">
        {t.avatar ? (
          <img src={t.avatar} alt="" className="landing-testimonial-avatar" />
        ) : (
          <span className="landing-testimonial-avatar landing-testimonial-avatar--initials">
            {initials}
          </span>
        )}
        <div>
          <p className="landing-testimonial-name">{t.name}</p>
          <p className="landing-testimonial-meta">{t.meta}</p>
        </div>
      </div>
      <p className="landing-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
    </article>
  );
}

export function TestimonialsSection() {
  return (
    <section className="landing-testimonials-section">
      <div className="text-center">
        <SectionLabel>What Operators Say</SectionLabel>
        <h2 className="landing-testimonials-title">Testimonials</h2>
      </div>
      <div className="landing-testimonial-rows">
        <div className="landing-testimonial-row">
          {ROW_ONE.map((t) => (
            <TestimonialCard key={`${t.name}-1`} t={t} />
          ))}
        </div>
        <div className="landing-testimonial-row landing-testimonial-row--offset">
          {ROW_TWO.map((t) => (
            <TestimonialCard key={`${t.name}-2`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
