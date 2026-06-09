"use client";

import { useCallback, useEffect, useState } from "react";

type Doc = {
  id: string;
  title: string;
  source_type: string;
  content: string | null;
  source_url: string | null;
  created_at: string;
};

function previewSanitized(text: string): string {
  return text
    .replace(/Champions\s+Funding/gi, "program guidelines")
    .replace(/theLender/gi, "rate sheet provider")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email redacted]")
    .slice(0, 300);
}

export function KnowledgeManager() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<"markdown" | "url" | "pdf" | "docx">("markdown");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/knowledge");
    const data = await res.json();
    setDocs(data.documents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        source_type: sourceType,
        content: sourceType === "markdown" || sourceType === "pdf" || sourceType === "docx"
          ? content
          : undefined,
        source_url: sourceType === "url" ? sourceUrl : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create");
      return;
    }

    setTitle("");
    setContent("");
    setSourceUrl("");
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/admin/knowledge/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleReindex(id: string) {
    setReindexing(id);
    await fetch(`/api/admin/knowledge/${id}/reindex`, { method: "POST" });
    setReindexing(null);
    await load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Add document</h2>
        <p className="mt-1 text-xs text-black/50">
          Content is sanitized before Supermemory indexing — lender names and PII are stripped.
        </p>
        <div className="mt-4 space-y-4">
          <input
            className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            value={sourceType}
            onChange={(e) =>
              setSourceType(e.target.value as "markdown" | "url" | "pdf" | "docx")
            }
          >
            <option value="markdown">Markdown text</option>
            <option value="pdf">PDF extract (paste text)</option>
            <option value="docx">Word/docx extract (paste text)</option>
            <option value="url">URL fetch</option>
          </select>
          {sourceType === "url" ? (
            <input
              className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm"
              placeholder="https://…"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
            />
          ) : (
            <textarea
              className="w-full rounded-lg border border-black/10 px-4 py-2 font-mono text-sm"
              rows={8}
              placeholder="Paste content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          )}
          {content ? (
            <div className="rounded-lg bg-vn-bg p-3 text-xs text-black/60">
              <div className="font-medium text-black/70">Sanitization preview</div>
              <p className="mt-1">{previewSanitized(content)}…</p>
            </div>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="rounded-full bg-vn-green px-6 py-2 text-sm font-medium text-white"
          >
            Add & sync to Supermemory
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Documents ({docs.length})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-black/50">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">No documents yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-start justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-black">{doc.title}</div>
                  <div className="text-xs text-black/50">
                    {doc.source_type} · {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  {doc.content ? (
                    <p className="mt-1 line-clamp-2 text-sm text-black/60">
                      {doc.content.slice(0, 200)}…
                    </p>
                  ) : null}
                </div>
                <div className="ml-4 flex shrink-0 gap-3">
                  <button
                    type="button"
                    disabled={reindexing === doc.id}
                    onClick={() => handleReindex(doc.id)}
                    className="text-sm text-vn-green hover:underline disabled:opacity-50"
                  >
                    {reindexing === doc.id ? "Reindexing…" : "Reindex"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
