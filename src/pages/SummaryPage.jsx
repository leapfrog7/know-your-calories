import { useMemo, useState } from "react";
import { getAllDays } from "../features/meals/mealStorage";
import { buildPeriodSummary } from "../features/meals/summaryHelpers";
import { formatDisplayDate } from "../features/meals/mealHelpers";

function SummaryPage() {
  const [mode, setMode] = useState("week");

  const summary = useMemo(() => {
    return buildPeriodSummary(getAllDays(), mode);
  }, [mode]);

  const title = mode === "week" ? "This Week" : "This Month";

  return (
    <div className="space-y-5 pb-28">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Summary
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl font-black tracking-tight">{title}</h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                {formatDisplayDate(summary.startDate)} to{" "}
                {formatDisplayDate(summary.endDate)}
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/10">
              <p className="text-lg font-black leading-none text-white">
                {summary.loggedDayCount}
              </p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                logged days
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1">
            <PeriodButton
              label="This Week"
              active={mode === "week"}
              onClick={() => setMode("week")}
            />

            <PeriodButton
              label="This Month"
              active={mode === "month"}
              onClick={() => setMode("month")}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Average intake
            </p>

            <h3 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              {summary.averages.calories}
              <span className="ml-1 text-base font-black text-slate-400">
                kcal
              </span>
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Per logged day
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
            <p className="text-sm font-black text-emerald-700">
              {summary.loggedDayCount}/{summary.totalDays}
            </p>
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700/70">
              consistency
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MacroBox
            label="Protein"
            value={summary.averages.protein}
            className="bg-emerald-50 ring-1 ring-emerald-100"
            labelClassName="text-emerald-700"
            valueClassName="text-emerald-950"
          />

          <MacroBox
            label="Carbs"
            value={summary.averages.carbs}
            className="bg-sky-50 ring-1 ring-sky-100"
            labelClassName="text-sky-700"
            valueClassName="text-sky-950"
          />

          <MacroBox
            label="Fat"
            value={summary.averages.fat}
            className="bg-amber-50 ring-1 ring-amber-100"
            labelClassName="text-amber-700"
            valueClassName="text-amber-950"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              Consistency
            </h3>

            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
              Days with at least one food entry.
            </p>
          </div>

          <div className="shrink-0 rounded-3xl bg-slate-950 px-4 py-3 text-right">
            <p className="text-xl font-black leading-none text-white">
              {summary.loggedDayCount}/{summary.totalDays}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
              days
            </p>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600"
            style={{
              width: `${
                summary.totalDays
                  ? Math.round(
                      (summary.loggedDayCount / summary.totalDays) * 100
                    )
                  : 0
              }%`,
            }}
          />
        </div>

        {summary.highestDay && (
          <div className="mt-4 rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Highest calorie day
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-950">
                {formatDisplayDate(summary.highestDay.date)}
              </p>

              <p className="rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
                {summary.highestDay.totals.calories} kcal
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              Daily calories
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Logged intake across the selected period.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            {summary.dailyRows.length} days
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {summary.dailyRows.map((day) => (
            <DailyBar
              key={day.date}
              day={day}
              maxCalories={summary.maxCalories}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black tracking-tight text-slate-950">
              Most logged foods
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Foods appearing most often in this period.
            </p>
          </div>

          {summary.mostLoggedFoods.length > 0 && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Top {summary.mostLoggedFoods.length}
            </span>
          )}
        </div>

        {summary.mostLoggedFoods.length === 0 ? (
          <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-center">
            <p className="text-2xl">🍽️</p>
            <p className="mt-2 text-sm font-bold text-slate-600">
              No food frequency yet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Add foods for a few days to see repeat patterns here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {summary.mostLoggedFoods.map((food, index) => (
              <FoodFrequencyRow key={food.foodId} food={food} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PeriodButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
        active
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-400 active:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function MacroBox({
  label,
  value,
  className = "bg-slate-100",
  labelClassName = "text-slate-500",
  valueClassName = "text-slate-950",
}) {
  return (
    <div className={`rounded-2xl px-3 py-3 ${className}`}>
      <p className={`text-[10px] font-black uppercase tracking-wide ${labelClassName}`}>
        {label}
      </p>

      <p className={`mt-1 text-base font-black ${valueClassName}`}>
        {value}
        <span className="ml-0.5 text-xs font-bold opacity-70">g</span>
      </p>
    </div>
  );
}

function DailyBar({ day, maxCalories }) {
  const width =
    day.hasLog && maxCalories
      ? Math.max(8, Math.round((day.totals.calories / maxCalories) * 100))
      : 0;

  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-700">{day.label}</p>

          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            {day.hasLog ? "Logged" : "No entry"}
          </p>
        </div>

        <p
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            day.hasLog
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {day.hasLog ? `${day.totals.calories} kcal` : "No log"}
        </p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white">
        {day.hasLog && (
          <div
            className="h-full rounded-full bg-emerald-600"
            style={{ width: `${width}%` }}
          />
        )}
      </div>
    </div>
  );
}

function FoodFrequencyRow({ food, index }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-700 shadow-sm">
          #{index + 1}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">
            {food.name}
          </p>

          <p className="text-xs font-semibold text-slate-400">
            {food.count} time{food.count === 1 ? "" : "s"} logged
          </p>
        </div>
      </div>

      <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
        <p className="text-sm font-black leading-none text-slate-800">
          {food.calories}
        </p>
        <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
          kcal
        </p>
      </div>
    </div>
  );
}

export default SummaryPage;