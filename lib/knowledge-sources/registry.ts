import type { StructuredToolInterface } from "@langchain/core/tools";

export type KnowledgeSourceKind =
  | "markdown"
  | "pdf"
  | "url"
  | "api"
  | "connector"
  | "docx";

export type KnowledgeHit = {
  title: string;
  content: string;
  sourceId: string;
  score?: number;
};

export type IngestResult = {
  ok: boolean;
  count?: number;
  error?: string;
};

export type KnowledgeSourceHandler = {
  id: string;
  kinds: KnowledgeSourceKind[];
  containerTag: string;
  enabled?: boolean;
  ingest(input: unknown): Promise<IngestResult>;
  search(query: string, limit?: number): Promise<KnowledgeHit[]>;
  asTool?(): StructuredToolInterface;
};

const sources = new Map<string, KnowledgeSourceHandler>();

export function registerKnowledgeSource(handler: KnowledgeSourceHandler): void {
  sources.set(handler.id, handler);
}

export function getKnowledgeSource(id: string): KnowledgeSourceHandler | undefined {
  return sources.get(id);
}

export function listKnowledgeSources(): KnowledgeSourceHandler[] {
  return [...sources.values()];
}

export function listEnabledKnowledgeSources(): KnowledgeSourceHandler[] {
  return listKnowledgeSources().filter((s) => s.enabled !== false);
}

export async function searchAllKnowledgeSources(
  query: string,
  limit = 5,
): Promise<KnowledgeHit[]> {
  const enabled = listEnabledKnowledgeSources();
  const perSource = Math.max(2, Math.ceil(limit / Math.max(enabled.length, 1)));

  const batches = await Promise.all(
    enabled.map(async (source) => {
      try {
        return await source.search(query, perSource);
      } catch {
        return [];
      }
    }),
  );

  return batches
    .flat()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}
