import { PendingBadge } from "./pending-badge";

const tabs = [
  "Purchase New Deal",
  "Refi Rate & term",
  "Cash-out Pull equity",
  "Bridge → DSCR Balloon exit",
];

const checks = ["✓ No SSN", "✓ No credit pull", "✓ No account needed"];

/** Static Figma-style form preview on the landing page (non-interactive). */
export function LoanFormPreview() {
  return (
    <div
      id="loan-inquiry-form"
      className="mt-10 overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#fcfcfc] px-4 py-3">
        <span className="size-3 rounded-full bg-[#9a9a9a]/40" />
        <span className="size-3 rounded-full bg-[#9a9a9a]/30" />
        <span className="size-3 rounded-full bg-[#9a9a9a]/20" />
      </div>
      <div className="flex flex-wrap gap-2 border-b border-black/5 bg-[#f3f3f3] px-4 py-3">
        {tabs.map((tab, i) => (
          <span
            key={tab}
            className={`rounded-md px-3 py-1.5 text-[13px] ${
              i === 0
                ? "bg-white font-semibold text-black shadow-sm"
                : "font-light text-black/70"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="space-y-6 p-6">
        <div>
          <p className="mb-2 text-lg text-black">Property address</p>
          <div className="flex items-center justify-between rounded-lg border border-black/5 bg-white px-4 py-3">
            <span className="text-sm font-light text-black">
              1234 Gulf Pine Drive, Sarasota, FL
            </span>
            <span className="text-xs text-black/40" aria-hidden>
              ▾
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-black">
          <span className="rounded border border-black/10 bg-white px-3 py-2">
            🇺🇸 United States
          </span>
          <span className="text-xs text-black/40" aria-hidden>
            ▾
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PreviewPills label="Target down payment" active="20%" />
          <PreviewPills label="Self-reported FICO" active="720-739" />
          <PreviewPills label="Intended strategy" active="Long-term" />
        </div>
        <PreviewPills label="Borrower type" active="US Citizen" />
      </div>
      <div className="flex flex-wrap items-center gap-6 border-t border-black/5 px-6 py-4">
        {checks.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 text-base font-medium text-vn-green"
          >
            {item}
            {item.includes("No account needed") ? (
              <PendingBadge label="sign-in is currently required, implementation pending" />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewPills({ label, active }: { label: string; active: string }) {
  return (
    <div>
      <p className="mb-2 text-lg text-black">{label}</p>
      <span className="inline-block rounded-md bg-vn-green px-3 py-1.5 text-xs font-semibold text-white">
        {active}
      </span>
    </div>
  );
}
