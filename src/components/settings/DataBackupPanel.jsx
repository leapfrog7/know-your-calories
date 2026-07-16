import { useRef, useState } from "react";
import {
  downloadBackupFile,
  getBackupReminderStatus,
  parseBackupFile,
} from "../../features/backup/backupHelpers";
import {
  mergeImportedDays,
  replaceAllDays,
  saveMealSettings,
} from "../../features/meals/mealStorage";
import {
  getFavoriteFoodIds,
  saveFavoriteFoodIds,
} from "../../features/favorites/favoriteStorage";
import {
  mergeCustomFoods,
  replaceCustomFoods,
} from "../../data/customFoodUtils";
function DataBackupPanel() {
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState("");
  const [pendingBackup, setPendingBackup] = useState(null);
  const [pendingFileName, setPendingFileName] = useState("");
  const [lastBackupAt, setLastBackupAt] = useState(() => {
    return getBackupReminderStatus().lastBackupAt;
  });

  function handleExport() {
    const backedUpAt = downloadBackupFile();
    setLastBackupAt(backedUpAt);
    setStatus("Backup file downloaded.");
  }

  function handleImportClick() {
    setStatus("");
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const backup = await parseBackupFile(file);

      setPendingBackup(backup);
      setPendingFileName(file.name);
      setStatus("");
    } catch (error) {
      setPendingBackup(null);
      setPendingFileName("");
      setStatus(error.message || "Could not import backup.");
    } finally {
      event.target.value = "";
    }
  }

  function handleReplaceImport() {
    if (!pendingBackup) return;

    replaceAllDays(pendingBackup.data.days);
    saveFavoriteFoodIds(pendingBackup.data.favorites || []);
    if (pendingBackup.compatibility?.hasCustomFoods) {
      replaceCustomFoods(pendingBackup.data.customFoods);
    }
    if (pendingBackup.compatibility?.hasSettings) {
      saveMealSettings(pendingBackup.data.settings);
    }

    setPendingBackup(null);
    setPendingFileName("");
    setStatus("Backup imported. Existing data was replaced.");

    window.location.reload();
  }

  function handleMergeImport() {
    if (!pendingBackup) return;

    mergeImportedDays(pendingBackup.data.days);

    const mergedFavoriteIds = [
      ...new Set([
        ...getFavoriteFoodIds(),
        ...(pendingBackup.data.favorites || []),
      ]),
    ];

    saveFavoriteFoodIds(mergedFavoriteIds);
    if (pendingBackup.compatibility?.hasCustomFoods) {
      mergeCustomFoods(pendingBackup.data.customFoods);
    }
    if (pendingBackup.compatibility?.hasSettings) {
      saveMealSettings(pendingBackup.data.settings);
    }

    setPendingBackup(null);
    setPendingFileName("");
    setStatus("Backup imported and merged with existing data.");

    window.location.reload();
  }

  function handleCancelImport() {
    setPendingBackup(null);
    setPendingFileName("");
    setStatus("Import cancelled.");
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Backup
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Import / Export Data
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Save your meal logs, custom foods, favorites, and targets as a
            backup file and restore them on another device.
          </p>
        </div>

        <div className="shrink-0 rounded-3xl bg-emerald-50 px-3 py-2 text-2xl">
          💾
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-sm transition active:scale-[0.98]"
        >
          Export
        </button>

        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm transition active:scale-[0.98]"
        >
          Import
        </button>
      </div>

      <p className="mt-3 text-xs font-bold text-slate-500">
        {lastBackupAt
          ? `Last backup: ${new Date(lastBackupAt).toLocaleDateString()}`
          : "No backup has been recorded on this device yet."}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {pendingBackup && (
        <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
            Import backup
          </p>

          <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">
            Choose how to restore data
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Backup selected:{" "}
            <span className="font-black text-slate-800">{pendingFileName}</span>
          </p>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={handleMergeImport}
              className="group flex w-full items-center gap-3 rounded-3xl border border-emerald-100 bg-white p-3 text-left shadow-sm transition active:scale-[0.98] active:bg-emerald-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                🔀
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-950">
                  Merge with existing
                </span>
                <span className="mt-0.5 block text-xs font-medium leading-relaxed text-slate-500">
                  Keeps current logs and adds missing backup entries.
                </span>
              </span>

              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white"
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <button
              type="button"
              onClick={handleReplaceImport}
              className="group flex w-full items-center gap-3 rounded-3xl border border-rose-100 bg-white p-3 text-left shadow-sm transition active:scale-[0.98] active:bg-rose-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-xl">
                🧹
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-950">
                  Start fresh / Replace
                </span>
                <span className="mt-0.5 block text-xs font-medium leading-relaxed text-slate-500">
                  Clears current logs and restores only this backup.
                </span>
              </span>

              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-black text-white"
                aria-hidden="true"
              >
                ↻
              </span>
            </button>

            <button
              type="button"
              onClick={handleCancelImport}
              className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-500 shadow-sm transition active:scale-[0.98] active:bg-slate-50"
            >
              Cancel import
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-amber-800/80">
            Merge keeps your current logs and adds missing backup entries.
            Replace clears current logs and restores only the backup data.
          </p>
        </div>
      )}

      {status && (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold leading-relaxed text-slate-600">
          {status}
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-400">
        The backup file is stored on your device. It is not uploaded anywhere.
      </p>
    </section>
  );
}

export default DataBackupPanel;
