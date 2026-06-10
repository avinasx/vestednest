import { AdminPageHeader } from "@/components/admin/admin-shell";
import { LogicManager } from "@/components/admin/logic-manager";

export default function AdminLogicPage() {
  return (
    <>
      <AdminPageHeader
        badge="Underwriting"
        title="Logic Engine"
        lead="Logic documents drive the rate engine, DSCR thresholds, and state eligibility guardrails. Content is sanitized before storage — wholesale lender names are never indexed."
      />
      <LogicManager />
    </>
  );
}
