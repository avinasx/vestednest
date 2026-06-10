import { createServiceClient } from "@/lib/supabase/service";
import { formatRulesSummary, getActiveLogicRules } from "@/lib/logic";
import { hybridSearchContainer } from "@/lib/supermemory";
import type { KnowledgeSourceHandler } from "./registry";

export const LOGIC_DOCS_ID = "logic-docs";
export const LOGIC_DOCS_CONTAINER = "vn-kb-logic";

export const logicDocsSource: KnowledgeSourceHandler = {
  id: LOGIC_DOCS_ID,
  kinds: ["markdown", "api"],
  containerTag: LOGIC_DOCS_CONTAINER,
  enabled: true,

  async ingest() {
    const service = createServiceClient();
    if (!service) return { ok: false, error: "No database client" };

    const rules = await getActiveLogicRules();
    const summary = formatRulesSummary(rules);
    const { syncKnowledgeToContainer } = await import("@/lib/supermemory");
    await syncKnowledgeToContainer(
      "logic-rules-summary",
      "Vested Nest Logic Rules",
      summary,
      LOGIC_DOCS_CONTAINER,
    );
    return { ok: true, count: 1 };
  },

  async search(query, limit = 5) {
    const hybrid = await hybridSearchContainer(query, LOGIC_DOCS_CONTAINER, limit);
    if (hybrid.length > 0) {
      return hybrid.map((r) => ({
        title: r.title,
        content: r.content,
        sourceId: LOGIC_DOCS_ID,
        score: r.score,
      }));
    }

    const rules = await getActiveLogicRules();
    const summary = formatRulesSummary(rules);
    if (!summary) return [];
    return [
      {
        title: "Vested Nest Logic Rules",
        content: summary,
        sourceId: LOGIC_DOCS_ID,
        score: 1,
      },
    ];
  },
};
