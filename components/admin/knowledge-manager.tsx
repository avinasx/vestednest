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
        content:
          sourceType === "markdown" || sourceType === "pdf" || sourceType === "docx"
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
    <div className="admin-stack admin-stack--lg">
      <form onSubmit={handleCreate} className="admin-card">
        <h2 className="admin-card-title">Add document</h2>
        <p className="admin-card-sub">
          Content is sanitized before Supermemory indexing — lender names and PII are stripped.
        </p>
        <div className="admin-form-stack admin-card-body">
          <input
            className="admin-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="admin-select"
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
              className="admin-input"
              placeholder="https://…"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
            />
          ) : (
            <textarea
              className="admin-textarea"
              rows={8}
              placeholder="Paste content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          )}
          {content ? (
            <div className="admin-preview">
              <div className="admin-preview-title">Sanitization preview</div>
              <p style={{ marginTop: 6 }}>{previewSanitized(content)}…</p>
            </div>
          ) : null}
          {error ? <p className="secondary-error">{error}</p> : null}
          <button type="submit" className="admin-btn-primary">
            Add & sync to Supermemory
          </button>
        </div>
      </form>

      <section className="admin-card">
        <h2 className="admin-card-title">Documents ({docs.length})</h2>
        {loading ? (
          <p className="admin-card-body admin-message">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="admin-card-body admin-message">No documents yet.</p>
        ) : (
          <ul className="admin-list admin-list--divided admin-card-body">
            {docs.map((doc) => (
              <li key={doc.id} style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="admin-list-item-title">{doc.title}</div>
                  <div className="admin-list-item-meta">
                    {doc.source_type} · {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                  {doc.content ? (
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {doc.content.slice(0, 200)}…
                    </p>
                  ) : null}
                </div>
                <div className="admin-actions" style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    disabled={reindexing === doc.id}
                    onClick={() => handleReindex(doc.id)}
                    className="admin-btn-link"
                  >
                    {reindexing === doc.id ? "Reindexing…" : "Reindex"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="admin-btn-danger"
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
