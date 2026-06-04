import { ArrowRight } from "./icons";
import { PendingBadge } from "./pending-badge";
import { SectionWide } from "./section";

export function BridgeSection() {
  return (
    <SectionWide surface className="py-16 md:py-24">
      <p className="text-xl font-medium text-vn-green">BRIDGE → DSCR</p>
      <h2 className="mt-4 max-w-[900px] text-[40px] font-medium leading-tight text-[#111111] md:text-[46px]">
        Exit your bridge before it kills your IRR.
      </h2>
      <p className="mt-6 max-w-[900px] text-lg font-light leading-8 text-black">
        Bridge interest at 11–13% compounds against your margin every day.
        Conventional refi takes 45 days. We close in 14. Every day saved on a
        $400K bridge at 12% APR is $131. Every week is $920. Every month is
        $4,000. The difference between our 14-day close and a conventional
        45-day close is real money in your pocket.
      </p>
      <a
        href="#"
        className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-black px-6 text-lg font-semibold text-white"
      >
        Calculate your bridge savings
        <ArrowRight />
        <PendingBadge label="bridge savings calculator not yet built" />
      </a>

      <div className="mt-12 rounded-2xl border border-black/5 bg-white p-8 md:p-12">
        <p className="text-lg font-light text-black/70">
          EXAMPLE · $400K BRIDGE AT 12% APR
        </p>
        <p className="mt-2 text-[56px] font-medium leading-none text-vn-green md:text-[74px]">
          $4,074
        </p>
        <p className="mt-4 max-w-[640px] text-lg font-light leading-8 text-black/80">
          Bridge interest saved by closing in 14 days vs. a conventional 45-day
          refi.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-black/10 pt-10 md:grid-cols-4">
          <Stat label="DAILY BLEED AT 12%" value="$131" />
          <Stat label="DAYS SAVED" value="31" />
          <Stat label="NEW RATE" value="7.500%" />
          <Stat label="MONTHLY PITIA" value="$3,180" />
        </div>
      </div>
    </SectionWide>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-light text-black/70">{label}</p>
      <p className="mt-2 text-4xl font-medium text-black">{value}</p>
    </div>
  );
}
