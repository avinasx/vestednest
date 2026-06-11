/* eslint-disable @next/next/no-img-element */

export function VestedNestLogo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const textClass = variant === "light" ? "vn-logo-text text-white" : "text-black";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/landing/bird-icon.png"
        alt=""
        aria-hidden
        className={`vn-logo-bird${variant === "light" ? " vn-logo-bird--light" : ""}`}
        width={28}
        height={27}
      />
      <span className={`vn-logo-text text-[22px] font-normal tracking-tight lowercase ${textClass}`}>
        vestednest
      </span>
    </div>
  );
}
