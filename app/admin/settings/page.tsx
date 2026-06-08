import { SettingsManager } from "@/components/admin/settings-manager";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Settings</h1>
      <p className="mt-1 text-sm text-black/60">
        Rate engine configuration, funded states, loan officer roster, and integration status.
      </p>
      <div className="mt-8">
        <SettingsManager />
      </div>
    </div>
  );
}
