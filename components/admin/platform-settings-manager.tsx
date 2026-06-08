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
  ai: "AI (Gemini)",
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
    <div className="space-y-6">
      <p className="text-sm text-black/60">
        Integration credentials and runtime config. Saved values live in Supabase and apply to all
        server jobs. Only Supabase URL/keys and deploy secrets stay in{" "}
        <code className="rounded bg-black/5 px-1 text-xs">.env</code>.
      </p>
      {Object.entries(byCategory).map(([cat, items]) => (
        <section key={cat} className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-black">{CATEGORY_LABELS[cat] ?? cat}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {items.map((s) => (
              <label key={s.key} className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-black">{s.label}</span>
                {s.description ? (
                  <span className="text-xs text-black/50">{s.description}</span>
                ) : null}
                {s.type === "boolean" ? (
                  <select
                    value={drafts[s.key] ?? "false"}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                    className="rounded-lg border border-black/10 px-2 py-1.5"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    type={s.type === "number" ? "number" : "text"}
                    value={drafts[s.key] ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                    autoComplete={s.isSecret ? "off" : undefined}
                    className="rounded-lg border border-black/10 px-2 py-1.5 font-mono text-xs"
                  />
                )}
                <span className="text-[10px] text-black/40">Source: {s.source}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
      {message ? <p className="text-sm text-black/60">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={seeding}
          onClick={() => void seedFromEnv(false)}
          className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-50"
        >
          {seeding ? "Importing…" : "Import from .env"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-full bg-vn-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save integrations"}
        </button>
      </div>
    </div>
  );
}
