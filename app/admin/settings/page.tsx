import { AdminPageHeader } from "@/components/admin/admin-shell";
import { PlatformSettingsManager } from "@/components/admin/platform-settings-manager";
import { SettingsManager } from "@/components/admin/settings-manager";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        badge="Configuration"
        title="Settings"
        lead="Integrations, rate engine, funded states, and loan officer roster."
      />

      <section className="admin-settings-section">
        <div>
          <h2 className="admin-section-title">Integrations</h2>
          <p className="admin-section-lead">
            API keys and runtime config stored in Supabase (overrides .env).
          </p>
        </div>
        <PlatformSettingsManager />
      </section>

      <section className="admin-settings-section">
        <div>
          <h2 className="admin-section-title">Rate & eligibility</h2>
          <p className="admin-section-lead">
            Base rate, funded states, environment health, and loan officer roster.
          </p>
        </div>
        <SettingsManager />
      </section>
    </>
  );
}
