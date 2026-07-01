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
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          Summary
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Based on logged days from {formatDisplayDate(summary.startDate)} to{" "}
          {formatDisplayDate(summary.endDate)}.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("week")}
            className={`rounded-xl px-4 py-3 text-sm font-black transition ${
              mode === "week"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            This Week
          </button>

          <button
            type="button"
            onClick={() => setMode("month")}
            className={`rounded-xl px-4 py-3 text-sm font-black transition ${
              mode === "month"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            This Month
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
        <p className="text-sm font-semibold text-slate-400">
          Average per logged day
        </p>

        <p className="mt-2 text-4xl font-black tracking-tight">
          {summary.averages.calories}
          <span className="ml-1 text-base font-bold text-slate-400">kcal</span>
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MacroBox label="Protein" value={summary.averages.protein} />
          <MacroBox label="Carbs" value={summary.averages.carbs} />
          <MacroBox label="Fat" value={summary.averages.fat} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">Consistency</h3>
            <p className="mt-1 text-sm text-slate-500">
              Days with at least one food entry.
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
            <p className="text-xl font-black text-emerald-700">
              {summary.loggedDayCount}/{summary.totalDays}
            </p>
            <p className="text-xs font-bold text-emerald-700">days</p>
          </div>
        </div>

        {summary.highestDay && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Highest calorie day
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {formatDisplayDate(summary.highestDay.date)} ·{" "}
              {summary.highestDay.totals.calories} kcal
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Daily calories</h3>

        <div className="mt-4 space-y-3">
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
        <h3 className="text-lg font-black text-slate-950">Most logged foods</h3>

        {summary.mostLoggedFoods.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No food frequency yet. Add foods for a few days to see patterns.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {summary.mostLoggedFoods.map((food) => (
              <div
                key={food.foodId}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
              >
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {food.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {food.count} time{food.count === 1 ? "" : "s"} logged
                  </p>
                </div>

                <p className="text-sm font-black text-slate-700">
                  {food.calories} kcal
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MacroBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-base font-black text-white">{value}g</p>
    </div>
  );
}

function DailyBar({ day, maxCalories }) {
  const width = day.hasLog
    ? Math.max(8, Math.round((day.totals.calories / maxCalories) * 100))
    : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="w-14 shrink-0 text-xs font-black text-slate-500">
          {day.label}
        </p>

        <p className="text-xs font-bold text-slate-400">
          {day.hasLog ? `${day.totals.calories} kcal` : "No log"}
        </p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
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

export default SummaryPage;
