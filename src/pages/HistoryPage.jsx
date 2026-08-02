import { useMemo, useState } from "react";
import {
  getAllDays,
  getConsumedEntries,
  getMealSettings,
  getWaterTotal,
} from "../features/meals/mealStorage";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";
import {
  formatDisplayDate,
  getTodayKey,
  groupEntriesByMeal,
  MEAL_ORDER,
} from "../features/meals/mealHelpers";
import { formatWaterAmount } from "../features/hydration/hydrationHelpers";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HistoryPage() {
  const days = useMemo(() => getAllDays(), []);
  const settings = useMemo(() => getMealSettings(), []);
  const todayKey = getTodayKey();
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, days, todayKey),
    [visibleMonth, days, todayKey],
  );

  const selectedDay = useMemo(() => {
    return buildDayDetails(selectedDateKey, days[selectedDateKey]);
  }, [days, selectedDateKey]);

  const currentMonth = startOfMonth(new Date());
  const canGoNext = visibleMonth < currentMonth;

  function changeMonth(offset) {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    );
    setVisibleMonth(nextMonth);

    const today = new Date();
    const isCurrentMonth =
      nextMonth.getFullYear() === today.getFullYear() &&
      nextMonth.getMonth() === today.getMonth();
    setSelectedDateKey(
      isCurrentMonth
        ? todayKey
        : formatDateKey(
            new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0),
          ),
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 active:bg-slate-200"
            aria-label="Previous month"
          >
            ‹
          </button>

          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600">
              Food history
            </p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-950">
              {formatMonth(visibleMonth)}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={!canGoNext}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1" aria-hidden="true">
          {WEEKDAYS.map((weekday) => (
            <p
              key={weekday}
              className="py-1 text-center text-[10px] font-black uppercase tracking-wide text-slate-400"
            >
              {weekday}
            </p>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label={formatMonth(visibleMonth)}>
          {calendarDays.map((day) => (
            <CalendarDay
              key={day.key}
              day={day}
              selected={day.dateKey === selectedDateKey}
              calorieTarget={settings.defaultCalorieTarget}
              onSelect={setSelectedDateKey}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-400">
          <LegendDot className="bg-emerald-100" label="Light" />
          <LegendDot className="bg-emerald-300" label="Moderate" />
          <LegendDot className="bg-emerald-600" label="Near target" />
          <span>• Water logged</span>
        </div>
      </section>

      <SelectedDayPanel day={selectedDay} settings={settings} />
    </div>
  );
}

function CalendarDay({ day, selected, calorieTarget, onSelect }) {
  if (!day.inMonth) return <span className="min-h-[62px]" aria-hidden="true" />;

  const tone = getCalorieTone(day.calories, calorieTarget, day.hasFood);
  const disabled = day.isFuture;

  return (
    <button
      type="button"
      role="gridcell"
      onClick={() => onSelect(day.dateKey)}
      disabled={disabled}
      aria-label={`${formatDisplayDate(day.dateKey)}${day.hasFood ? `, ${day.calories} calories` : ", no food logged"}`}
      aria-selected={selected}
      className={`relative min-h-[62px] rounded-xl border px-0.5 py-2 text-center transition active:scale-[0.96] ${
        selected
          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
          : `${tone} border-transparent`
      } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
    >
      <span className={`block text-sm font-black ${day.isToday && !selected ? "text-emerald-700" : ""}`}>
        {day.dayNumber}
      </span>
      <span className={`mt-1 block truncate text-[9px] font-black ${selected ? "text-slate-300" : day.hasFood ? "text-current opacity-75" : "text-slate-300"}`}>
        {day.hasFood ? formatCompactCalories(day.calories) : "—"}
      </span>
      {day.hasWater && (
        <span className={`mx-auto mt-1 block h-1 w-1 rounded-full ${selected ? "bg-cyan-300" : "bg-cyan-600"}`} />
      )}
    </button>
  );
}

function SelectedDayPanel({ day, settings }) {
  const calorieTarget = Number(settings.defaultCalorieTarget) || 2000;
  const progress = Math.min(100, Math.round((day.totals.calories / calorieTarget) * 100));

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              Selected day
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              {formatDisplayDate(day.dateKey)}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {day.entries.length} item{day.entries.length === 1 ? "" : "s"} logged
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-right">
            <p className="text-lg font-black leading-none text-white">{day.totals.calories}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">kcal</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-right text-[10px] font-bold text-slate-400">
          {day.totals.calories} / {calorieTarget} kcal
        </p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <DayStat label="Protein" value={`${day.totals.protein}g`} tone="emerald" />
          <DayStat label="Carbs" value={`${day.totals.carbs}g`} tone="sky" />
          <DayStat label="Fat" value={`${day.totals.fat}g`} tone="amber" />
          <DayStat label="Water" value={formatWaterAmount(day.waterMl)} tone="cyan" />
        </div>
      </div>

      {day.entries.length === 0 ? (
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-8 text-center">
          <p className="text-2xl">🍽️</p>
          <p className="mt-2 text-sm font-black text-slate-700">No food logged</p>
          <p className="mt-1 text-xs text-slate-500">Choose another highlighted date to review its meals.</p>
        </div>
      ) : (
        <div className="border-t border-slate-100 px-5 pb-2">
          {MEAL_ORDER.map((meal) => {
            const entries = day.groupedEntries[meal] || [];
            if (!entries.length) return null;
            return <HistoryMeal key={meal} meal={meal} entries={entries} />;
          })}
        </div>
      )}
    </section>
  );
}

function HistoryMeal({ meal, entries }) {
  const calories = entries.reduce((total, entry) => total + (Number(entry.calories) || 0), 0);
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-950">{meal}</p>
        <p className="text-xs font-black text-slate-500">{Math.round(calories)} kcal</p>
      </div>
      <div className="mt-2 space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">{entry.foodName}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{entry.servingText || entry.portionLabel}</p>
            </div>
            <p className="shrink-0 text-xs font-bold text-slate-500">{entry.calories} kcal</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayStat({ label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800",
    sky: "bg-sky-50 text-sky-800",
    amber: "bg-amber-50 text-amber-800",
    cyan: "bg-cyan-50 text-cyan-800",
  };
  return (
    <div className={`min-w-0 rounded-xl px-2 py-2.5 text-center ${tones[tone]}`}>
      <p className="truncate text-[9px] font-black uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 truncate text-xs font-black">{value}</p>
    </div>
  );
}

function LegendDot({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded ${className}`} /> {label}
    </span>
  );
}

function buildCalendarDays(month, days, todayKey) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstDayOffset; index += 1) {
    cells.push({ key: `empty-start-${index}`, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = formatDateKey(new Date(year, monthIndex, day));
    const entries = getConsumedEntries(days[dateKey]?.entries || []);
    const totals = roundTotals(calculateTotals(entries));
    cells.push({
      key: dateKey,
      dateKey,
      dayNumber: day,
      inMonth: true,
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
      hasFood: entries.length > 0,
      hasWater: getWaterTotal(days[dateKey]?.waterEntries || []) > 0,
      calories: totals.calories,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, inMonth: false });
  }
  return cells;
}

function buildDayDetails(dateKey, dayLog) {
  const entries = getConsumedEntries(dayLog?.entries || []);
  return {
    dateKey,
    entries,
    groupedEntries: groupEntriesByMeal(entries),
    totals: roundTotals(calculateTotals(entries)),
    waterMl: getWaterTotal(dayLog?.waterEntries || []),
  };
}

function getCalorieTone(calories, target, hasFood) {
  if (!hasFood) return "bg-slate-50 text-slate-400";
  const ratio = calories / Math.max(1, Number(target) || 2000);
  if (ratio >= 0.8) return "bg-emerald-600 text-white";
  if (ratio >= 0.45) return "bg-emerald-300 text-emerald-950";
  return "bg-emerald-100 text-emerald-900";
}

function formatCompactCalories(calories) {
  if (calories >= 1000) return `${(calories / 1000).toFixed(1)}k`;
  return `${calories}`;
}

function formatMonth(date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default HistoryPage;
