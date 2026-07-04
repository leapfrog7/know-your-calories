import DataBackupPanel from "../components/settings/DataBackupPanel";
import TargetSettingsPanel from "../components/settings/TargetSettingsPanel";
import ClearDataPanel from "../components/settings/ClearDataPanel";

function SettingsPage() {
  return (
    <div className="space-y-5 pb-28">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Settings
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl font-black tracking-tight">
                App Controls
              </h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                Manage targets, backup, restore and local data.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-2xl ring-1 ring-white/10">
              ⚙️
            </div>
          </div>
        </div>
      </section>

      <TargetSettingsPanel />

      <DataBackupPanel />

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Privacy
        </p>

        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
          Local-first storage
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Your meal logs are stored on this device. They are not uploaded to a
          server. Use Export Backup before changing phones, clearing browser
          data, or reinstalling the app.
        </p>
      </section>

      <ClearDataPanel />
    </div>
  );
}

export default SettingsPage;
