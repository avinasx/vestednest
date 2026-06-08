import { PlatformSettingsManager } from "@/components/admin/platform-settings-manager";
import { SettingsManager } from "@/components/admin/settings-manager";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Settings</h1>
      <p className="mt-1 text-sm text-black/60">
        Integrations, rate engine, funded states, and loan officer roster.
      </p>
      <div className="mt-8 space-y-12">
        <section>
          <h2 className="text-lg font-semibold text-black">Integrations</h2>
          <p className="mt-1 text-sm text-black/60">
            API keys and runtime config stored in Supabase (overrides .env).
          </p>
          <div className="mt-6">
            <PlatformSettingsManager />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-black">Rate & eligibility</h2>
          <div className="mt-6">
            <SettingsManager />
          </div>
        </section>
      </div>
    </div>
  );
}
