import { SettingsView } from "@/features/settings/settings-view";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] text-warmwhite">Settings</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Manage connected sources and the memory engine.
        </p>
      </div>
      <SettingsView />
    </div>
  );
}
