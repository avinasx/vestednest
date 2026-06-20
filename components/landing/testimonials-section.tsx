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
  {
    name: "Carlos V.",
    meta: "Miami, FL — 12-unit multi-family acquisition",
    quote:
      "Traditional banks took months to underwrite the rent roll. We had clear-to-close in 14 days and secured the asset before the seller walked.",
    avatar: "",
    muted: true,
  },
  {
    name: "Rachel K.",
    meta: "Dallas, TX — Short-term rental (STR) portfolio",
    quote:
      "Most lenders run scared from Airbnb revenue. Vested Nest used AirDNA data and locked in a rate that made the cash flow work beautifully.",
    avatar: "",
    muted: false,
  },
  {
    name: "David H.",
    meta: "Columbus, OH — BRRRR strategy",
    quote:
      "Fastest draw process I've experienced. We rehabbed a duplex, leased it, and refi'd into a 30-year fixed DSCR without skipping a beat.",
    avatar: "",
    muted: true,
  },
  {
    name: "Anita P.",
    meta: "Charlotte, NC — First-time commercial property",
    quote:
      "I thought moving from residential to an 8-plex would be a nightmare. They held my hand through the LLC structuring and closed exactly on time.",
    avatar: "",
    muted: false,
  },
  {
    name: "Greg S.",
    meta: "Las Vegas, NV — 1031 Exchange",
    quote:
      "We were up against our 1031 timeline and our original lender ghosted. These guys stepped in, funded the bridge loan in 9 days, and saved the deal.",
    avatar: "",
    muted: false,
  },
  {
    name: "Tyler M.",
    meta: "Indianapolis, IN — Out-of-state investor",
    quote:
      "Investing from California into the Midwest requires a lender who understands the local yield. They got it instantly. Smooth virtual closing.",
    avatar: "",
    muted: true,
  },
  {
    name: "Elena R.",
    meta: "Denver, CO — Cash-out refinance",
    quote:
      "Unlocked $300k of equity from our stabilised portfolio to fund our next two down payments. No tax returns required. Pure efficiency.",
    avatar: "",
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
    name: "Michael B.",
    meta: "San Antonio, TX — 20-door portfolio consolidation",
    quote:
      "We had five different loans maturing at different times. They wrapped everything into a single portfolio loan with a blended rate that beat the street.",
    avatar: "",
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
  {
    name: "Jonathan F.",
    meta: "Memphis, TN — Turnkey rentals",
    quote:
      "I buy 2-3 turnkey properties a quarter. Vested Nest is the only lender I use now. Send the contract, they send the term sheet. Done.",
    avatar: "",
    muted: false,
  },
  {
    name: "Sarah W.",
    meta: "Raleigh, NC — Ground-up construction to DSCR",
    quote:
      "The transition from construction loan to permanent DSCR was seamless. We didn't have to scramble for a new appraisal or go through underwriting twice.",
    avatar: "",
    muted: true,
  },
  {
    name: "Omar J.",
    meta: "Detroit, MI — Fix and Flip",
    quote:
      "Got a 90% LTC / 100% Rehab loan with a rate that actually left room for profit. The draw requests were funded within 48 hours every time.",
    avatar: "",
    muted: false,
  },
  {
    name: "Amanda D.",
    meta: "Kansas City, MO — 5-unit value-add",
    quote:
      "We bought a mismanaged 5-plex. Used their bridge loan to acquire and renovate, then rolled into a 30-year fixed once rents were stabilized. Masterclass execution.",
    avatar: "",
    muted: true,
  },
  {
    name: "Brian C.",
    meta: "Houston, TX — Foreign National Investor",
    quote:
      "As a non-US resident, financing is usually incredibly difficult. They mapped out the entire DSCR process for my US LLC and made it effortless.",
    avatar: "",
    muted: false,
  },
  {
    name: "Stephanie M.",
    meta: "Orlando, FL — Vacation rental investment",
    quote:
      "The property had no long-term lease, but the projected short-term rental income was strong. They underwrote the deal based on the asset's potential, not my W2.",
    avatar: "",
    muted: false,
  },
  {
    name: "Victor T.",
    meta: "Cleveland, OH — 8-unit mixed-use",
    quote:
      "We had a retail space on the bottom and apartments on top. A lot of lenders won't touch mixed-use, but Vested Nest understood the asset class and funded it in three weeks.",
    avatar: "",
    muted: true,
  },
];

type Testimonial = {
  name: string;
  meta: string;
  quote: string;
  avatar: string;
  muted: boolean;
};

function TestimonialMarqueeRow({
  items,
  direction,
  offset,
}: {
  items: Testimonial[];
  direction: "rtl" | "ltr";
  offset?: boolean;
}) {
  const trackClass =
    direction === "rtl"
      ? "landing-testimonial-marquee__track landing-testimonial-marquee__track--rtl"
      : "landing-testimonial-marquee__track landing-testimonial-marquee__track--ltr";

  const renderGroup = (suffix: string, hidden: boolean) => (
    <div className="landing-testimonial-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <TestimonialCard key={`${t.name}${suffix}`} t={t} />
      ))}
    </div>
  );

  return (
    <div
      className={`landing-testimonial-marquee${offset ? " landing-testimonial-marquee--offset" : ""}`}
    >
      <div className={trackClass}>
        {renderGroup("-a", false)}
        {renderGroup("-b", true)}
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
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
        <SectionLabel>WHAT OPERATORS SAY</SectionLabel>
        <h2 className="landing-testimonials-title">Testimonials</h2>
      </div>
      <div className="landing-testimonial-rows">
        <TestimonialMarqueeRow items={ROW_ONE} direction="rtl" />
        <TestimonialMarqueeRow items={ROW_TWO} direction="ltr" offset />
      </div>
    </section>
  );
}
