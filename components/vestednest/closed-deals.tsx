import { Section } from "./section";

const deals = [
  {
    tag: "BRIDGE → DSCR",
    city: "Atlanta, GA",
    stats: "$680K · 7.500% · ARV $925K · 12d",
    caption: "Saved $4,074 in bridge interest",
    image: "from-emerald-900/80 to-emerald-950",
  },
  {
    tag: "BRIDGE → DSCR",
    city: "Atlanta, GA",
    stats: "$680K · 7.500% · ARV $925K · 12d",
    caption: "Saved $4,074 in bridge interest",
    image: "from-slate-700 to-slate-900",
  },
  {
    tag: "DSCR · CASH-OUT",
    city: "Phoenix, AZ",
    stats: "$520K · 7.625% · Cash out $98K",
    caption: "STR · 4-unit small multi",
    image: "from-amber-800/70 to-stone-900",
  },
  {
    tag: "DSCR · REFI",
    city: "Nashville, TN",
    stats: "$612K · 7.125% · Saves $420/mo",
    caption: "Rate-and-term · SFR",
    image: "from-indigo-900/70 to-slate-900",
  },
  {
    tag: "DSCR · REFI",
    city: "Nashville, TN",
    stats: "$612K · 7.125% · Saves $420/mo",
    caption: "Rate-and-term · SFR",
    image: "from-teal-900/70 to-slate-900",
  },
];

export function ClosedDeals() {
  return (
    <Section className="py-16 md:py-20">
      <p className="text-center text-xl font-medium tracking-wide text-vn-green">
        CLOSED THIS MONTH
      </p>
      <h2 className="mt-4 text-center text-[40px] font-medium leading-tight text-[#111111] md:text-[46px]">
        Real deals. Real terms.
      </h2>
      <p className="mx-auto mt-4 max-w-[650px] text-center text-lg font-light leading-8 text-black">
        Anonymized so you can see the math. Updated weekly from our funded
        pipeline.
      </p>
      <div className="-mx-6 mt-10 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
        {deals.map((deal, i) => (
          <article
            key={`${deal.city}-${i}`}
            className="w-[280px] shrink-0 overflow-hidden rounded-lg border border-black/5 bg-[#fefefd] shadow-sm md:w-[340px]"
          >
            <div
              className={`h-[120px] bg-gradient-to-br ${deal.image}`}
            />
            <div className="space-y-2 p-5">
              <p className="text-base font-semibold text-vn-green">{deal.tag}</p>
              <p className="text-2xl font-semibold text-[#0f0e0c]">{deal.city}</p>
              <p className="text-sm font-semibold text-[#0f0e0c]">{deal.stats}</p>
              <p className="text-base text-[#555554]">{deal.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
