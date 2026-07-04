import { useState } from "react";
import {
  getMealSettings,
  saveMealSettings,
} from "../../features/meals/mealStorage";

function TargetSettingsPanel() {
  const currentSettings = getMealSettings();

  const [calorieTarget, setCalorieTarget] = useState(
    currentSettings.defaultCalorieTarget || 2000,
  );

  const [proteinTarget, setProteinTarget] = useState(
    currentSettings.defaultProteinTarget || 80,
  );

  const [status, setStatus] = useState("");

  function handleSave() {
    const safeCalorieTarget = Math.max(1, Number(calorieTarget) || 2000);
    const safeProteinTarget = Math.max(1, Number(proteinTarget) || 80);

    saveMealSettings({
      defaultCalorieTarget: safeCalorieTarget,
      defaultProteinTarget: safeProteinTarget,
    });

    setCalorieTarget(safeCalorieTarget);
    setProteinTarget(safeProteinTarget);
    setStatus("Targets saved.");
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Daily goals
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Calorie & Protein Targets
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Set simple daily targets. These will be used on the Today screen.
          </p>
        </div>

        <div className="shrink-0 rounded-3xl bg-emerald-50 px-3 py-2 text-2xl">
          🎯
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="text-sm font-black text-slate-950">
            Daily calorie target
          </span>

          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={calorieTarget}
              onChange={(event) => setCalorieTarget(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-black text-slate-950 outline-none"
            />
            <span className="text-sm font-black text-slate-400">kcal</span>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-950">
            Daily protein target
          </span>

          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={proteinTarget}
              onChange={(event) => setProteinTarget(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-black text-slate-950 outline-none"
            />
            <span className="text-sm font-black text-slate-400">g</span>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98]"
      >
        Save targets
      </button>

      {status && (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          {status}
        </p>
      )}
    </section>
  );
}

export default TargetSettingsPanel;
