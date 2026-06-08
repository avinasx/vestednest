"use client";

import { useCallback, useEffect, useState } from "react";

type EnvStatus = Record<string, boolean>;

export function SettingsManager() {
  const [fundedStates, setFundedStates] = useState("");
  const [baseRate, setBaseRate] = useState("7.99");
  const [envStatus, setEnvStatus] = useState<EnvStatus>({});
  const [officers, setOfficers] = useState<{ id: string; name: string; email: string; active: boolean }[]>([]);
  const [loName, setLoName] = useState("");
  const [loEmail, setLoEmail] = useState("");
  const [loPhone, setLoPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [settingsRes, loRes] = await Promise.all([
      fetch("/api/admin/settings"),
      fetch("/api/admin/loan-officers"),
    ]);
    const settings = await settingsRes.json();
    const lo = await loRes.json();

    setEnvStatus(settings.envStatus ?? {});
    setOfficers(lo.officers ?? []);

    const s = settings.settings;
    if (s?.funded_states) setFundedStates(s.funded_states.join(", "));
    if (s?.rate_settings?.baseRate) setBaseRate(String(s.rate_settings.baseRate));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const states = fundedStates
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length === 2);

    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funded_states: states,
        rate_settings: { baseRate: parseFloat(baseRate) },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addOfficer(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/loan-officers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: loName, email: loEmail, phone: loPhone }),
    });
    setLoName("");
    setLoEmail("");
    setLoPhone("");
    await load();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Environment status</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(envStatus).map(([key, ok]) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <span className={ok ? "text-green-600" : "text-amber-600"}>
                {ok ? "✓" : "○"}
              </span>
              <span className="text-black/70">{key}</span>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={saveSettings} className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Rate & eligibility</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-black/70">Base rate (%)</label>
            <input
              className="mt-1 w-full max-w-xs rounded-lg border border-black/10 px-4 py-2 text-sm"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-black/70">Funded states (comma-separated 2-letter codes)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-black/10 px-4 py-2 text-sm font-mono"
              rows={3}
              value={fundedStates}
              onChange={(e) => setFundedStates(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-full bg-vn-green px-6 py-2 text-sm font-medium text-white">
            {saved ? "Saved!" : "Save settings"}
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Loan officers</h2>
        <form onSubmit={addOfficer} className="mt-4 flex flex-wrap gap-3">
          <input
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            placeholder="Name"
            value={loName}
            onChange={(e) => setLoName(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            placeholder="Email"
            value={loEmail}
            onChange={(e) => setLoEmail(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
            placeholder="Phone"
            value={loPhone}
            onChange={(e) => setLoPhone(e.target.value)}
          />
          <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-sm">
            Add officer
          </button>
        </form>
        <ul className="mt-4 divide-y divide-black/5">
          {officers.map((o) => (
            <li key={o.id} className="py-3 text-sm">
              <span className="font-medium">{o.name}</span>
              <span className="text-black/50"> · {o.email}</span>
              {!o.active ? <span className="ml-2 text-amber-600">inactive</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
