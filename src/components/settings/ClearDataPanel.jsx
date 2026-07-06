import { useState } from "react";
import { clearMealStorage } from "../../features/meals/mealStorage";
import { clearFavoriteFoods } from "../../features/favorites/favoriteStorage";

function ClearDataPanel() {
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState("");

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  function handleClearData() {
    if (!canDelete) {
      setStatus("Type DELETE to confirm.");
      return;
    }

    clearMealStorage();
    clearFavoriteFoods();

    setStatus("All local meal data and favorites have been cleared.");

    window.location.reload();
  }

  return (
    <section className="rounded-[2rem] border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
            Danger zone
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Clear All Data
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            This clears all local meal logs and settings from this device.
            Export a backup before using this.
          </p>
        </div>

        <div className="shrink-0 rounded-3xl bg-rose-50 px-3 py-2 text-2xl">
          🧹
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-black text-slate-950">
          Type DELETE to confirm
        </span>

        <input
          type="text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder="DELETE"
          className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black uppercase tracking-wide text-slate-950 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </label>

      <button
        type="button"
        onClick={handleClearData}
        disabled={!canDelete}
        className="mt-4 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        Clear all local data
      </button>

      {status && (
        <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold leading-relaxed text-slate-600">
          {status}
        </p>
      )}
    </section>
  );
}

export default ClearDataPanel;
