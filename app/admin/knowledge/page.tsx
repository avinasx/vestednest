import { KnowledgeManager } from "@/components/admin/knowledge-manager";

export default function AdminKnowledgePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Knowledge Base</h1>
      <p className="mt-1 text-sm text-black/60">
        Manage lending policies and product docs. Synced to Supermemory for Nest AI retrieval.
      </p>
      <div className="mt-8">
        <KnowledgeManager />
      </div>
    </div>
  );
}
