/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

type ProductAddressBarProps = {
  placeholder?: string;
  checks?: string[];
};

export function ProductAddressBar({
  placeholder = "Drop an address, or ask — e.g. I want a DSCR quote on 142 Oak Ridge Dr",
  checks = ["No hard pull", "No W2", "No DTI"],
}: ProductAddressBarProps) {
  return (
    <div className="fn-address-wrap">
      <Link href="/" className="fn-address-bar block no-underline text-inherit">
        <div className="fn-address-top">
          <img src="/landing/icon-stars.svg" alt="" aria-hidden width={20} height={20} />
          <input
            className="fn-address-input"
            placeholder={placeholder}
            readOnly
            tabIndex={-1}
            aria-hidden
          />
          <button type="button" className="fn-address-send" aria-label="Get quote">
            <img src="/landing/icon-arrow-forward.svg" alt="" />
          </button>
        </div>
        <div className="fn-address-foot">
          <span className="text-[#24933e]">Home loan ▾</span>
          <div className="fn-address-checks">
            {checks.map((c) => (
              <span key={c}>
                <img src="/figma-assets/imgArrowDown01.svg" alt="" aria-hidden />
                {c}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-2">
            AI Mode
            <span className="inline-block h-[18px] w-[35px] rounded-full bg-[#26943f] relative">
              <span className="absolute right-[3px] top-[2.5px] size-[13px] rounded-full bg-white" />
            </span>
          </span>
        </div>
      </Link>
    </div>
  );
}
