import { SectionWide } from "./section";

const steps = [
  {
    n: "1",
    time: "~6 SECONDS",
    title: "Drop the address",
    body: "Paste it. Type it. We fetch rent comps, AVM, tax, insurance, flood — in seconds.",
  },
  {
    n: "2",
    time: "60 SECONDS",
    title: "See the math",
    body: "DSCR ratio, rate, points, monthly PITIA, time-to-close. Live numbers, not a teaser.",
  },
  {
    n: "3",
    time: "SAME SESSION",
    title: "Download the term sheet",
    body: "Real indicative term sheet PDF. Forwardable to your realtor, partner, or attorney.",
  },
  {
    n: "4",
    time: "DAYS 1-7",
    title: "Submit + appraise",
    body: "LLC docs, lease (if any), property insurance binder. Appraisal ordered day one.",
  },
  {
    n: "5",
    time: "DAY 14",
    title: "Close",
    body: "Final terms locked. Wire on day 14. No re-papering, no last-minute pricing changes.",
  },
];

export function HowItWorks() {
  return (
    <SectionWide surface className="py-16 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,455px)_1fr] lg:gap-16">
        <div>
          <p className="text-xl font-medium text-vn-green">HOW IT WORKS</p>
          <h2 className="mt-4 text-[40px] font-medium leading-tight text-[#111111] md:text-[46px]">
            Five steps.
            <br />
            No surprises.
          </h2>
          <p className="mt-6 text-lg font-light leading-8 text-black">
            From address-drop to wired funds. Most loans close in 14 days because
            we read the property the same day you do.
          </p>
        </div>
        <ol className="space-y-0">
          {steps.map((step, i) => (
            <li
              key={step.n}
              className={`grid grid-cols-[48px_1fr] gap-x-6 gap-y-1 border-black/10 py-8 ${
                i < steps.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="text-2xl font-normal text-black/30">{step.n}</span>
              <div>
                <p className="text-lg font-medium text-vn-green">{step.time}</p>
                <h3 className="mt-1 text-[22px] font-semibold text-black">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[560px] text-sm font-light leading-6 text-black/80">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionWide>
  );
}
