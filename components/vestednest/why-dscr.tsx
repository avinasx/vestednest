import { Section } from "./section";

const features = [
  {
    title: "The property qualifies, not your W2.",
    body: "No DTI. No tax returns. No employment verification. We underwrite the rent the property generates. If it cash-flows, it qualifies.",
  },
  {
    title: "We can quote your rate. On screen. Right now.",
    body: "Consumer mortgages are bound by TRID. Ours aren't — they're business-purpose. So you see rate, points, and payment live. Nobody else can do this.",
  },
  {
    title: "Fourteen days to a closed loan.",
    body: "Conventional refi: 45 days. Ours: 14. On a $400K bridge at 12%, that's $4,074 you keep instead of bleeding to interest.",
  },
];

export function WhyDscr() {
  return (
    <Section className="py-16 md:py-24">
      <div className="text-center">
        <p className="text-xl font-medium text-vn-green">WHY DSCR IS DIFFERENT</p>
        <h2 className="mx-auto mt-4 max-w-[748px] text-[40px] font-medium leading-tight text-[#111111] md:text-[46px]">
          Conventional lenders can&apos;t do this.
        </h2>
        <p className="mx-auto mt-6 max-w-[748px] text-lg font-light leading-8 text-black">
          Business-purpose loans to LLC borrowers are TRID/RESPA exempt.
          That&apos;s why we can quote on screen and close in 14 days.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="rounded-xl border border-black/5 bg-white p-8"
          >
            <div className="mb-4 size-3 rounded-sm bg-vn-green" />
            <h3 className="text-2xl font-medium leading-snug text-black">
              {f.title}
            </h3>
            <p className="mt-4 text-base font-light leading-7 text-black/80">
              {f.body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
