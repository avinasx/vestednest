import { ArrowRight } from "./icons";
import { Section } from "./section";

export function FinalCta() {
  return (
    <Section className="py-16 md:py-20">
      <div className="text-center">
        <h2 className="text-[40px] font-medium leading-tight text-[#111111] md:text-[46px]">
          Drop the address. We&apos;ll do the rest
        </h2>
        <p className="mx-auto mt-6 max-w-[800px] text-lg font-light leading-8 text-black">
          Sixty seconds to a real indicative term sheet. Fourteen days to a
          closed loan. The property does the qualifying.
        </p>
        <a
          href="#"
          className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-black px-8 text-lg font-semibold text-white"
        >
          Start with an address
          <ArrowRight />
        </a>
        <p className="mx-auto mt-10 max-w-[915px] text-sm font-light leading-6 text-black/60">
          Equal Housing Lender · Lending in 38 states · Business-purpose loans
          to LLC borrowers · Non-owner-occupied investment properties only
        </p>
      </div>
    </Section>
  );
}
