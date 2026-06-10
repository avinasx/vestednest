import {
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  listKnowledgeDocuments,
  reindexKnowledgeDocument,
  updateKnowledgeDocument,
} from "@/lib/knowledge-base";
import { hybridSearchContainer } from "@/lib/supermemory";
import type { KnowledgeSourceHandler } from "./registry";

export const ADMIN_KB_ID = "admin-kb";
export const ADMIN_KB_CONTAINER = "vn-kb-global";

export const adminKbSource: KnowledgeSourceHandler = {
  id: ADMIN_KB_ID,
  kinds: ["markdown", "pdf", "url", "docx"],
  containerTag: ADMIN_KB_CONTAINER,
  enabled: true,

  async ingest() {
    return { ok: true, count: (await listKnowledgeDocuments()).length };
  },

  async search(query, limit = 5) {
    const results = await hybridSearchContainer(query, ADMIN_KB_CONTAINER, limit);
    return results.map((r) => ({
      title: r.title,
      content: r.content,
      sourceId: ADMIN_KB_ID,
      score: r.score,
    }));
  },
};

export {
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  listKnowledgeDocuments,
  reindexKnowledgeDocument,
  updateKnowledgeDocument,
};
