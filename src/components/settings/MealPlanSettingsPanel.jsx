import { useState } from "react";
import {
  getMealSettings,
  saveMealSettings,
} from "../../features/meals/mealStorage";
import { formatMealTime } from "../../features/meals/mealPlanHelpers";

const MEALS = ["Breakfast", "Lunch", "Evening Snack", "Dinner"];

function MealPlanSettingsPanel() {
  const currentSettings = getMealSettings();
  const [mode, setMode] = useState(currentSettings.mealPlanMode || "time");
  const [mealTimes, setMealTimes] = useState(currentSettings.mealTimes || {});
  const [status, setStatus] = useState("");

  function handleTimeChange(meal, value) {
    setMealTimes((current) => ({ ...current, [meal]: value }));
  }

  function handleSave() {
    saveMealSettings({ mealPlanMode: mode, mealTimes });
    setStatus("Meal planning preferences saved.");
  }

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
        Meal planning
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        Plan confirmation
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Planned meals count only after you confirm that you ate them.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ModeButton
          active={mode === "time"}
          label="Meal times"
          onClick={() => setMode("time")}
        />
        <ModeButton
          active={mode === "manual"}
          label="Manual"
          onClick={() => setMode("manual")}
        />
      </div>

      {mode === "time" && (
        <div className="mt-4 space-y-3">
          {MEALS.map((meal) => (
            <label
              key={meal}
              className="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50/60 px-3 py-2.5"
            >
              <span>
                <span className="block text-sm font-black text-slate-800">
                  {meal}
                </span>
                <span className="block text-xs font-medium text-slate-500">
                  {formatMealTime(mealTimes[meal])}
                </span>
              </span>
              <input
                type="time"
                value={mealTimes[meal] || ""}
                onChange={(event) => handleTimeChange(meal, event.target.value)}
                className="rounded-xl border border-indigo-100 bg-white px-2 py-1.5 text-sm font-black text-indigo-700 outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        className="mt-5 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98]"
      >
        Save planning preferences
      </button>

      {status && (
        <p className="mt-4 rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
          {status}
        </p>
      )}
    </section>
  );
}

function ModeButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-sm font-black ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-indigo-100 bg-indigo-50 text-indigo-700"
      }`}
    >
      {label}
    </button>
  );
}

export default MealPlanSettingsPanel;
