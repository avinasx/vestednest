"use client";

import { useCallback, useEffect, useState } from "react";

type SettingView = {
  key: string;
  label: string;
  description: string;
  type: "string" | "number" | "boolean";
  category: string;
  isSecret: boolean;
  value: string | number | boolean | null;
  source: string;
  hasValue?: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  ai: "AI (Gemini & LangSmith)",
  data: "Property data",
  memory: "Memory",
  email: "Email (SendGrid)",
  twilio: "Twilio",
  credit: "Credit vendor",
  app: "App",
};

export function PlatformSettingsManager() {
  const [settings, setSettings] = useState<SettingView[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/platform-settings");
    const data = (await res.json()) as { settings?: SettingView[]; error?: string };
    if (data.settings) {
      setSettings(data.settings);
      const d: Record<string, string> = {};
      for (const s of data.settings) {
        if (s.type === "boolean") {
          d[s.key] = String(s.value === true);
        } else {
          d[s.key] = s.value == null ? "" : String(s.value);
        }
      }
      setDrafts(d);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byCategory = settings.reduce<Record<string, SettingView[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  async function seedFromEnv(overwrite: boolean) {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/platform-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overwrite }),
      });
      const data = (await res.json()) as {
        error?: string;
        result?: { inserted: number; updated: number; skipped: number };
      };
      if (!res.ok) {
        setMessage(data.error ?? "Import failed");
        return;
      }
      const r = data.result;
      setMessage(
        r
          ? `Imported from .env/defaults: ${r.inserted} new, ${r.updated} updated, ${r.skipped} skipped.`
          : "Imported.",
      );
      await load();
    } finally {
      setSeeding(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = settings.map((def) => {
        const value = drafts[def.key] ?? "";
        if (def.type === "boolean") return { key: def.key, value: value === "true" };
        if (def.type === "number") return { key: def.key, value: value === "" ? null : Number(value) };
        return { key: def.key, value: value === "" ? null : value };
      });
      const res = await fetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      setMessage("Saved. Database values override environment variables at runtime.");
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-stack">
      <p className="admin-section-lead">
        Integration credentials and runtime config. Saved values live in Supabase and apply to all
        server jobs. Only Supabase URL/keys and deploy secrets stay in{" "}
        <code style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.05)", fontSize: "0.75rem" }}>
          .env
        </code>
        .
      </p>
      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat} className="admin-card">
          <h3 className="admin-card-title">{CATEGORY_LABELS[cat] ?? cat}</h3>
          <div className="admin-settings-grid admin-card-body">
            {items.map((s) => (
              <label key={s.key} className="admin-field">
                <span className="admin-label">{s.label}</span>
                {s.description ? (
                  <span className="admin-card-sub" style={{ marginTop: 0 }}>
                    {s.description}
                  </span>
                ) : null}
                {s.type === "boolean" ? (
                  <select
                    value={drafts[s.key] ?? "false"}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type={s.type === "number" ? "number" : s.isSecret ? "password" : "text"}
                    value={drafts[s.key] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                    autoComplete={s.isSecret ? "off" : undefined}
                    className="admin-input admin-input--mono"
                  />
                )}
                <span className="admin-list-item-meta">Source: {s.source}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
      {message ? <p className="admin-message">{message}</p> : null}
      <div className="admin-actions">
        <button
          type="button"
          disabled={seeding}
          onClick={() => void seedFromEnv(false)}
          className="admin-btn-secondary"
        >
          {seeding ? "Importing…" : "Import from .env"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="admin-btn-primary"
        >
          {saving ? "Saving…" : "Save integrations"}
        </button>
      </div>
    </div>
  );
}
