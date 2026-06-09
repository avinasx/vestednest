import { LogicManager } from "@/components/admin/logic-manager";

export default function AdminLogicPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Underwriting Logic</h1>
      <p className="mt-1 text-sm text-black/60">
        Logic documents drive the rate engine, DSCR thresholds, and state eligibility guardrails.
        Content is sanitized before storage — wholesale lender names are never indexed.
      </p>
      <div className="mt-8">
        <LogicManager />
      </div>
    </div>
  );
}
