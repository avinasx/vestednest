import { sanitizeContent, sanitizeTitle } from "@/lib/sanitize";
import { createServiceClient } from "@/lib/supabase/service";
import {
  deleteKnowledgeMemory,
  searchKnowledgeMemory,
  syncKnowledgeMemory,
} from "@/lib/supermemory";

export type KnowledgeDocument = {
  id: string;
  title: string;
  source_type: "markdown" | "pdf" | "url" | "docx";
  content: string | null;
  file_path: string | null;
  source_url: string | null;
  supermemory_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function listKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  const service = createServiceClient();
  if (!service) return [];

  const { data } = await service
    .from("knowledge_documents")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as KnowledgeDocument[];
}

export async function getKnowledgeDocument(id: string): Promise<KnowledgeDocument | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data } = await service
    .from("knowledge_documents")
    .select("*")
    .eq("id", id)
    .single();

  return (data as KnowledgeDocument) ?? null;
}

export async function createKnowledgeDocument(input: {
  title: string;
  source_type: "markdown" | "pdf" | "url" | "docx";
  content: string;
  file_path?: string | null;
  source_url?: string | null;
  created_by: string;
}): Promise<KnowledgeDocument | null> {
  const service = createServiceClient();
  if (!service) return null;

  const sanitized = sanitizeContent(input.content);

  const { data, error } = await service
    .from("knowledge_documents")
    .insert({
      title: sanitizeTitle(input.title),
      source_type: input.source_type,
      content: sanitized,
      file_path: input.file_path ?? null,
      source_url: input.source_url ?? null,
      created_by: input.created_by,
    })
    .select()
    .single();

  if (error || !data) return null;

  const doc = data as KnowledgeDocument;
  const memoryId = await syncKnowledgeMemory(doc.id, doc.title, doc.content ?? "");
  if (memoryId) {
    await service
      .from("knowledge_documents")
      .update({ supermemory_id: memoryId })
      .eq("id", doc.id);
    doc.supermemory_id = memoryId;
  }

  return doc;
}

export async function updateKnowledgeDocument(
  id: string,
  input: Partial<{
    title: string;
    content: string;
    file_path: string | null;
    source_url: string | null;
  }>,
): Promise<KnowledgeDocument | null> {
  const service = createServiceClient();
  if (!service) return null;

  const existing = await getKnowledgeDocument(id);
  if (!existing) return null;

  const patch = { ...input };
  if (patch.title) patch.title = sanitizeTitle(patch.title);
  if (patch.content) patch.content = sanitizeContent(patch.content);

  const { data, error } = await service
    .from("knowledge_documents")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;

  const doc = data as KnowledgeDocument;
  if (doc.supermemory_id) {
    await deleteKnowledgeMemory(doc.supermemory_id);
  }
  const memoryId = await syncKnowledgeMemory(doc.id, doc.title, doc.content ?? "");
  if (memoryId) {
    await service
      .from("knowledge_documents")
      .update({ supermemory_id: memoryId })
      .eq("id", id);
    doc.supermemory_id = memoryId;
  }

  return doc;
}

export async function deleteKnowledgeDocument(id: string): Promise<boolean> {
  const service = createServiceClient();
  if (!service) return false;

  const existing = await getKnowledgeDocument(id);
  if (!existing) return false;

  if (existing.supermemory_id) {
    await deleteKnowledgeMemory(existing.supermemory_id);
  }

  const { error } = await service.from("knowledge_documents").delete().eq("id", id);
  return !error;
}

export async function reindexKnowledgeDocument(id: string): Promise<KnowledgeDocument | null> {
  const doc = await getKnowledgeDocument(id);
  if (!doc) return null;

  const service = createServiceClient();
  if (!service) return null;

  const sanitized = sanitizeContent(doc.content ?? "");
  if (doc.supermemory_id) {
    await deleteKnowledgeMemory(doc.supermemory_id);
  }
  const memoryId = await syncKnowledgeMemory(doc.id, doc.title, sanitized);
  await service
    .from("knowledge_documents")
    .update({ content: sanitized, supermemory_id: memoryId })
    .eq("id", id);

  return { ...doc, content: sanitized, supermemory_id: memoryId };
}

export async function searchKnowledgeBase(query: string, limit = 5): Promise<string> {
  const results = await searchKnowledgeMemory(query, limit);
  if (results.length > 0) {
    return results.map((r) => `[${r.title}]\n${r.content}`).join("\n\n---\n\n");
  }

  const service = createServiceClient();
  if (!service) return "";

  const { data } = await service
    .from("knowledge_documents")
    .select("title, content")
    .ilike("content", `%${query.slice(0, 80)}%`)
    .limit(limit);

  if (!data?.length) return "";
  return data.map((d) => `[${d.title}]\n${d.content}`).join("\n\n---\n\n");
}

export async function fetchUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "VestedNest-KB/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50_000);
}
