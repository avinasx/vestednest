"use client";

import { useCallback, useEffect, useState } from "react";

type EnvStatus = Record<string, boolean>;

export function SettingsManager() {
  const [fundedStates, setFundedStates] = useState("");
  const [baseRate, setBaseRate] = useState("7.99");
  const [envStatus, setEnvStatus] = useState<EnvStatus>({});
  const [officers, setOfficers] = useState<
    { id: string; name: string; email: string; active: boolean }[]
  >([]);
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
    <div className="admin-stack admin-stack--lg">
      <section className="admin-card">
        <h2 className="admin-card-title">Environment status</h2>
        <ul className="admin-env-grid admin-card-body">
          {Object.entries(envStatus).map(([key, ok]) => (
            <li key={key} className="admin-env-item">
              <span className={ok ? "admin-env-ok" : "admin-env-warn"}>{ok ? "✓" : "○"}</span>
              <span>{key}</span>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={saveSettings} className="admin-card">
        <h2 className="admin-card-title">Rate & eligibility</h2>
        <div className="admin-form-stack admin-card-body">
          <div className="admin-field">
            <label className="admin-label" htmlFor="base-rate">
              Base rate (%)
            </label>
            <input
              id="base-rate"
              className="admin-input"
              style={{ maxWidth: 200 }}
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="funded-states">
              Funded states (comma-separated 2-letter codes)
            </label>
            <textarea
              id="funded-states"
              className="admin-textarea"
              rows={3}
              value={fundedStates}
              onChange={(e) => setFundedStates(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn-primary">
            {saved ? "Saved!" : "Save settings"}
          </button>
        </div>
      </form>

      <section className="admin-card">
        <h2 className="admin-card-title">Loan officers</h2>
        <form onSubmit={addOfficer} className="admin-inline-form admin-card-body">
          <input
            className="admin-input admin-input--inline"
            placeholder="Name"
            value={loName}
            onChange={(e) => setLoName(e.target.value)}
            required
          />
          <input
            className="admin-input admin-input--inline"
            placeholder="Email"
            value={loEmail}
            onChange={(e) => setLoEmail(e.target.value)}
            required
          />
          <input
            className="admin-input admin-input--inline"
            placeholder="Phone"
            value={loPhone}
            onChange={(e) => setLoPhone(e.target.value)}
          />
          <button type="submit" className="admin-btn-secondary">
            Add officer
          </button>
        </form>
        <ul className="admin-list admin-list--divided admin-card-body">
          {officers.map((o) => (
            <li key={o.id}>
              <div>
                <span className="admin-list-item-title">{o.name}</span>
                <span className="admin-list-item-meta"> · {o.email}</span>
                {!o.active ? (
                  <span style={{ marginLeft: 8, color: "#d97706", fontSize: "0.75rem" }}>
                    inactive
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
