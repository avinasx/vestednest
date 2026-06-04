export function VestedNestLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="28"
        height="24"
        viewBox="0 0 28 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 18C8 8 12 4 18 3C14 10 12 16 11 21C9 17 6 14 4 18Z"
          fill="#24933e"
        />
        <circle cx="9" cy="9" r="1.2" fill="#24933e" />
      </svg>
      <span className="text-[22px] font-normal tracking-tight text-black lowercase">
        vestednest
      </span>
    </div>
  );
}
