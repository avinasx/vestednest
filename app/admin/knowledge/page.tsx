import { AdminPageHeader } from "@/components/admin/admin-shell";
import { KnowledgeManager } from "@/components/admin/knowledge-manager";

export default function AdminKnowledgePage() {
  return (
    <>
      <AdminPageHeader
        badge="Nest AI"
        title="Knowledge Base"
        lead="Manage lending policies and product docs. Synced to Supermemory for Nest AI retrieval."
      />
      <KnowledgeManager />
    </>
  );
}
