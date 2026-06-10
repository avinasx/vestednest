"use client";

import { useCallback, useEffect, useState } from "react";

type LogicDoc = {
  id: string;
  title: string;
  source_type: string;
  version: string;
  updated_at: string;
};

type StateEntry = {
  state: string;
  status: string;
  brokerAttestation?: boolean;
  llcOnly?: boolean;
  notes?: string;
};

type Conflict = {
  id: string;
  severity: string;
  category: string;
  message: string;
  guidelineValue?: string;
  rateSheetValue?: string;
};

type ActiveRules = {
  summary: string[];
  dscr: { minQualifyingDscr: number; nearDscrMin: number };
  ltv: Record<string, number>;
  rateSettings: { baseRate?: number; reserveMonths?: number };
  stateMatrix: StateEntry[];
  conflicts: Conflict[];
};

export function LogicManager() {
  const [docs, setDocs] = useState<LogicDoc[]>([]);
  const [rules, setRules] = useState<ActiveRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("guidelines");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingMatrix, setSavingMatrix] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/logic");
    const data = await res.json();
    setDocs(data.documents ?? []);
    setRules(data.activeRules ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/logic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        source_type: sourceType,
        content,
        sync_settings: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to upload");
      return;
    }
    setTitle("");
    setContent("");
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this logic document?")) return;
    await fetch(`/api/admin/logic/${id}`, { method: "DELETE" });
    await load();
  }

  async function toggleStateBlocked(state: string) {
    if (!rules) return;
    const updated = rules.stateMatrix.map((s) => {
      if (s.state !== state) return s;
      const nextStatus = s.status === "blocked" ? "funded" : "blocked";
      return { ...s, status: nextStatus };
    });
    setSavingMatrix(true);
    await fetch("/api/admin/logic", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state_eligibility: updated }),
    });
    setSavingMatrix(false);
    await load();
  }

  const blockedCount = rules?.stateMatrix.filter((s) => s.status === "blocked").length ?? 0;
  const restrictedCount =
    rules?.stateMatrix.filter((s) => s.status === "restricted").length ?? 0;

  return (
    <div className="admin-stack admin-stack--lg">
      <section className="admin-card">
        <h2 className="admin-card-title">Active derived rules</h2>
        {loading || !rules ? (
          <p className="admin-card-body admin-message">Loading…</p>
        ) : (
          <div className="admin-card-body admin-form-stack">
            <ul className="admin-list" style={{ listStyle: "disc", paddingLeft: 20 }}>
              {rules.summary.map((line) => (
                <li key={line} style={{ fontSize: "0.875rem", color: "#4a5565" }}>
                  {line}
                </li>
              ))}
            </ul>
            <div className="admin-metric-grid">
              <div className="admin-metric">
                <div className="admin-metric-label">Min DSCR</div>
                <div className="admin-metric-value">{rules.dscr.minQualifyingDscr}</div>
              </div>
              <div className="admin-metric">
                <div className="admin-metric-label">Base rate</div>
                <div className="admin-metric-value">{rules.rateSettings.baseRate}%</div>
              </div>
              <div className="admin-metric">
                <div className="admin-metric-label">Reserve months</div>
                <div className="admin-metric-value">{rules.rateSettings.reserveMonths}</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {rules?.conflicts?.length ? (
        <section className="admin-alert">
          <h2 className="admin-alert-title">Conflict flags ({rules.conflicts.length})</h2>
          <ul className="admin-list" style={{ marginTop: 16 }}>
            {rules.conflicts.map((c) => (
              <li key={c.id} className="admin-alert-item">
                <span
                  style={{
                    fontWeight: 600,
                    color: c.severity === "error" ? "#b91c1c" : "#92400e",
                  }}
                >
                  [{c.severity}] {c.category}
                </span>
                <p style={{ marginTop: 6, color: "#4a5565" }}>{c.message}</p>
                {c.guidelineValue ? (
                  <p style={{ marginTop: 6, fontSize: "0.75rem", color: "#6b7280" }}>
                    Guidelines: {c.guidelineValue} · Rate sheet: {c.rateSheetValue}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="admin-card">
        <h2 className="admin-card-title">
          State eligibility matrix ({blockedCount} blocked, {restrictedCount} restricted)
        </h2>
        <p className="admin-card-sub">
          Click a state to toggle blocked/funded. NJ/NY attestation and VA LLC-only are preset.
        </p>
        {rules ? (
          <div className="admin-state-grid admin-card-body">
            {rules.stateMatrix.map((s) => (
              <button
                key={s.state}
                type="button"
                disabled={savingMatrix}
                onClick={() => toggleStateBlocked(s.state)}
                title={s.notes ?? s.status}
                className={`admin-state-pill${
                  s.status === "blocked"
                    ? " admin-state-pill--blocked"
                    : s.status === "restricted"
                      ? " admin-state-pill--restricted"
                      : " admin-state-pill--funded"
                }`}
              >
                {s.state}
                {s.brokerAttestation ? "*" : ""}
                {s.llcOnly ? "†" : ""}
              </button>
            ))}
          </div>
        ) : null}
        <p className="admin-card-sub" style={{ marginTop: 12 }}>
          * attestation required · † LLC only
        </p>
      </section>

      <form onSubmit={handleCreate} className="admin-card">
        <h2 className="admin-card-title">Upload logic document</h2>
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
            onChange={(e) => setSourceType(e.target.value)}
          >
            <option value="guidelines">Underwriting guidelines</option>
            <option value="program_matrix">Program matrix</option>
            <option value="state_licensing">State licensing</option>
            <option value="rate_sheet">Rate sheet</option>
            <option value="prepay_licensing">Prepay licensing</option>
          </select>
          <textarea
            className="admin-textarea"
            rows={6}
            placeholder="Paste sanitized extract (raw PDFs are not stored in git)…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          {error ? <p className="secondary-error">{error}</p> : null}
          <button type="submit" className="admin-btn-primary">
            Upload & sync rules
          </button>
        </div>
      </form>

      <section className="admin-card">
        <h2 className="admin-card-title">Logic documents ({docs.length})</h2>
        {docs.length === 0 ? (
          <p className="admin-card-body admin-message">
            No logic documents yet. Run seed script or upload above.
          </p>
        ) : (
          <ul className="admin-list admin-list--divided admin-card-body">
            {docs.map((doc) => (
              <li key={doc.id}>
                <div>
                  <div className="admin-list-item-title">{doc.title}</div>
                  <div className="admin-list-item-meta">
                    {doc.source_type} · v{doc.version} ·{" "}
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="admin-btn-danger"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
