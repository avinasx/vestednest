import { ApplyLink } from "./apply-link";
import { ArrowRight, PlayIcon } from "./icons";
import { LoanFormPreview } from "./loan-form-preview";
import { PendingBadge } from "./pending-badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-vn-bg pt-10 pb-16 md:pt-14 md:pb-20">
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-[100px]">
        <div className="flex flex-col gap-10 max-w-[820px]">
          <div>
            <h1 className="text-[40px] font-semibold leading-[1.15] tracking-tight text-black md:text-[52px]">
              Sixty seconds to a{" "}
              <span className="text-vn-green">term sheet</span>.
              <br />
              Fourteen days to{" "}
              <span className="text-vn-green">closed</span>.
            </h1>
            <p className="mt-6 max-w-[620px] text-xl font-light leading-8 text-black">
              DSCR loans for serious operators. Drop the address — we read the
              rent comps, run the math, and quote the rate, points, and payment
              on screen. No W2. No DTI. No 30-day forms.
            </p>
            <div className="mt-4 inline-flex rounded-md bg-[#f0f0f0] px-3 py-2">
              <span className="text-sm font-light text-black">
                We qualify the property, not your W2.
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <ApplyLink className="inline-flex h-14 items-center gap-2 rounded-full bg-vn-green px-6 text-lg font-semibold text-white">
                Start with an address
                <ArrowRight />
              </ApplyLink>
              <a
                href="#"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-black/10 bg-white px-6 text-lg font-medium text-black"
              >
                See a sample term sheet
                <PlayIcon />
                <PendingBadge label="sample term sheet not yet available" />
              </a>
            </div>
            <LoanFormPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
