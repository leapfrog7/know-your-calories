import { useState } from "react";
import {
  getMealSettings,
  saveMealSettings,
} from "../../features/meals/mealStorage";
import {
  formatClockTime,
  isValidHydrationWindow,
} from "../../features/hydration/hydrationHelpers";

function HydrationSettingsPanel() {
  const currentSettings = getMealSettings();
  const [targetMl, setTargetMl] = useState(
    currentSettings.defaultWaterTargetMl || 2000,
  );
  const [quickAddMl, setQuickAddMl] = useState(
    currentSettings.defaultWaterQuickAddMl || 250,
  );
  const [dayStart, setDayStart] = useState(
    currentSettings.hydrationDayStart || "07:00",
  );
  const [dayEnd, setDayEnd] = useState(
    currentSettings.hydrationDayEnd || "22:00",
  );
  const [status, setStatus] = useState("");

  function handleSave() {
    if (!isValidHydrationWindow(dayStart, dayEnd)) {
      setStatus("End time must be later than start time.");
      return;
    }

    const safeTarget = clampAmount(targetMl, 250, 10000, 2000);
    const safeQuickAdd = clampAmount(quickAddMl, 50, 2000, 250);

    saveMealSettings({
      defaultWaterTargetMl: safeTarget,
      defaultWaterQuickAddMl: safeQuickAdd,
      hydrationDayStart: dayStart,
      hydrationDayEnd: dayEnd,
    });

    setTargetMl(safeTarget);
    setQuickAddMl(safeQuickAdd);
    setStatus("Hydration preferences saved.");
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/70 p-5 shadow-sm">
      <div className="pointer-events-none absolute -bottom-10 -right-8 h-24 w-40 rounded-[50%] bg-cyan-100/60" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
          Hydration
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          Water preferences
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Choose your daily target and the amount added by the quick button.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <AmountField
            label="Daily target"
            min="250"
            max="10000"
            value={targetMl}
            onChange={setTargetMl}
          />
          <AmountField
            label="Quick add"
            min="50"
            max="2000"
            value={quickAddMl}
            onChange={setQuickAddMl}
          />
        </div>

        <div className="mt-3 rounded-3xl bg-white/80 p-3 ring-1 ring-cyan-100">
          <p className="text-xs font-black text-slate-700">
            Active hydration day
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            The pace indicator spreads your target evenly across these hours.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <TimeField
              label="Starts"
              value={dayStart}
              onChange={setDayStart}
            />
            <TimeField label="Ends" value={dayEnd} onChange={setDayEnd} />
          </div>

          <p className="mt-2 text-center text-[11px] font-bold text-cyan-700">
            {formatClockTime(dayStart)} to {formatClockTime(dayEnd)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-black text-white shadow-sm shadow-cyan-200 active:scale-[0.98]"
        >
          Save hydration preferences
        </button>

        {status && (
          <p className="mt-4 rounded-2xl bg-white/80 px-3 py-2 text-xs font-bold text-cyan-800 ring-1 ring-cyan-100">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}

function AmountField({ label, min, max, value, onChange }) {
  return (
    <label className="block rounded-2xl bg-white/80 p-3 ring-1 ring-cyan-100">
      <span className="text-xs font-black text-slate-700">{label}</span>
      <div className="mt-2 flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          step="50"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-lg font-black text-slate-950 outline-none"
        />
        <span className="text-xs font-black text-cyan-700">ml</span>
      </div>
    </label>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <label className="block rounded-2xl bg-cyan-50/60 px-3 py-2.5">
      <span className="block text-[11px] font-black text-slate-500">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-black text-cyan-800 outline-none"
      />
    </label>
  );
}

function clampAmount(value, min, max, fallback) {
  const amount = Math.round(Number(value));
  if (!Number.isFinite(amount)) return fallback;
  return Math.min(max, Math.max(min, amount));
}

export default HydrationSettingsPanel;
