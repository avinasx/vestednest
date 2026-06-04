type PendingBadgeProps = {
  /** Tooltip detail shown on hover/focus. */
  label?: string;
  /** Icon-only rendering for dense areas (nav, footer links). */
  compact?: boolean;
  className?: string;
};

/**
 * Marks a CTA or field whose behavior is not wired up yet.
 * Honest UX signal: "this is a placeholder, implementation pending".
 */
export function PendingBadge({
  label = "implementation pending",
  compact = false,
  className = "",
}: PendingBadgeProps) {
  const tooltip = `Placeholder — ${label}`;

  if (compact) {
    return (
      <span
        title={tooltip}
        aria-label={tooltip}
        className={`inline-flex items-center text-amber-500 ${className}`}
      >
        <ClockIcon />
      </span>
    );
  }

  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase leading-none tracking-wide text-amber-700 ${className}`}
    >
      <ClockIcon />
      Pending
    </span>
  );
}

function ClockIcon() {
  return (
    <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 4.75V8l2.25 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
