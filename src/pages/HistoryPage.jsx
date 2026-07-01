import { useMemo } from "react";
import { getSortedDayLogs } from "../features/meals/mealStorage";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";
import { formatDisplayDate } from "../features/meals/mealHelpers";

function HistoryPage() {
  const dayLogs = useMemo(() => getSortedDayLogs(), []);

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          Daily log
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          History
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Every day is saved separately. This will later power weekly and
          monthly summaries.
        </p>
      </section>

      {dayLogs.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm">
          <p className="font-black text-slate-950">No history yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add foods today and they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayLogs.map((dayLog) => {
            const totals = roundTotals(calculateTotals(dayLog.entries || []));

            return (
              <article
                key={dayLog.date}
                className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-black text-slate-950">
                      {formatDisplayDate(dayLog.date)}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {(dayLog.entries || []).length} item
                      {(dayLog.entries || []).length === 1 ? "" : "s"} logged
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-slate-950">
                      {totals.calories}
                    </p>
                    <p className="text-xs font-bold text-slate-400">kcal</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <SmallStat label="Protein" value={totals.protein} />
                  <SmallStat label="Carbs" value={totals.carbs} />
                  <SmallStat label="Fat" value={totals.fat} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SmallStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}g</p>
    </div>
  );
}

export default HistoryPage;
