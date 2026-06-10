export function VestedNestLogo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const fill = variant === "light" ? "#ffffff" : "#24933e";
  const textClass = variant === "light" ? "vn-logo-text text-white" : "text-black";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        className="vn-logo-bird"
        width="28"
        height="24"
        viewBox="0 0 28 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 18C8 8 12 4 18 3C14 10 12 16 11 21C9 17 6 14 4 18Z"
          fill={fill}
        />
        <circle className="vn-logo-bird" cx="9" cy="9" r="1.2" fill={fill} />
      </svg>
      <span className={`vn-logo-text text-[22px] font-normal tracking-tight lowercase ${textClass}`}>
        vestednest
      </span>
    </div>
  );
}
