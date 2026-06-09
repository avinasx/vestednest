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
    <div className="space-y-8">
      <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Active derived rules</h2>
        {loading || !rules ? (
          <p className="mt-4 text-sm text-black/50">Loading…</p>
        ) : (
          <div className="mt-4 space-y-4 text-sm text-black/80">
            <ul className="list-disc space-y-1 pl-5">
              {rules.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-vn-bg p-4">
                <div className="text-xs text-black/50">Min DSCR</div>
                <div className="text-xl font-semibold">{rules.dscr.minQualifyingDscr}</div>
              </div>
              <div className="rounded-lg bg-vn-bg p-4">
                <div className="text-xs text-black/50">Base rate</div>
                <div className="text-xl font-semibold">{rules.rateSettings.baseRate}%</div>
              </div>
              <div className="rounded-lg bg-vn-bg p-4">
                <div className="text-xs text-black/50">Reserve months</div>
                <div className="text-xl font-semibold">{rules.rateSettings.reserveMonths}</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {rules?.conflicts?.length ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            Conflict flags ({rules.conflicts.length})
          </h2>
          <ul className="mt-4 space-y-3">
            {rules.conflicts.map((c) => (
              <li key={c.id} className="rounded-lg border border-amber-200 bg-white p-4 text-sm">
                <span
                  className={
                    c.severity === "error"
                      ? "font-medium text-red-700"
                      : "font-medium text-amber-800"
                  }
                >
                  [{c.severity}] {c.category}
                </span>
                <p className="mt-1 text-black/70">{c.message}</p>
                {c.guidelineValue ? (
                  <p className="mt-1 text-xs text-black/50">
                    Guidelines: {c.guidelineValue} · Rate sheet: {c.rateSheetValue}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">
          State eligibility matrix ({blockedCount} blocked, {restrictedCount} restricted)
        </h2>
        <p className="mt-1 text-xs text-black/50">
          Click a state to toggle blocked/funded. NJ/NY attestation and VA LLC-only are preset.
        </p>
        {rules ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {rules.stateMatrix.map((s) => (
              <button
                key={s.state}
                type="button"
                disabled={savingMatrix}
                onClick={() => toggleStateBlocked(s.state)}
                title={s.notes ?? s.status}
                className={`rounded px-2 py-1 text-xs font-mono ${
                  s.status === "blocked"
                    ? "bg-red-100 text-red-800"
                    : s.status === "restricted"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-green-50 text-green-800"
                }`}
              >
                {s.state}
                {s.brokerAttestation ? "*" : ""}
                {s.llcOnly ? "†" : ""}
              </button>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-xs text-black/40">* attestation required · † LLC only</p>
      </section>

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-black">Upload logic document</h2>
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
            onChange={(e) => setSourceType(e.target.value)}
          >
            <option value="guidelines">Underwriting guidelines</option>
            <option value="program_matrix">Program matrix</option>
            <option value="state_licensing">State licensing</option>
            <option value="rate_sheet">Rate sheet</option>
            <option value="prepay_licensing">Prepay licensing</option>
          </select>
          <textarea
            className="w-full rounded-lg border border-black/10 px-4 py-2 font-mono text-sm"
            rows={6}
            placeholder="Paste sanitized extract (raw PDFs are not stored in git)…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="rounded-full bg-vn-green px-6 py-2 text-sm font-medium text-white"
          >
            Upload & sync rules
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Logic documents ({docs.length})</h2>
        {docs.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">
            No logic documents yet. Run seed script or upload above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-black">{doc.title}</div>
                  <div className="text-xs text-black/50">
                    {doc.source_type} · v{doc.version} ·{" "}
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="text-sm text-red-600 hover:underline"
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
