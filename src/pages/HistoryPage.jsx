import { useMemo } from "react";
import { getSortedDayLogs } from "../features/meals/mealStorage";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";
import { formatDisplayDate } from "../features/meals/mealHelpers";

function HistoryPage() {
  const dayLogs = useMemo(() => getSortedDayLogs(), []);

  const totalLoggedDays = dayLogs.length;

  const totalEntries = useMemo(() => {
    return dayLogs.reduce((sum, dayLog) => {
      return sum + (dayLog.entries || []).length;
    }, 0);
  }, [dayLogs]);

  return (
    <div className="space-y-5 pb-28">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Daily log
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl font-black tracking-tight">History</h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
                Review saved meals by date.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/10">
              <p className="text-lg font-black leading-none text-white">
                {totalLoggedDays}
              </p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                days
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <HeaderStat label="Items logged" value={totalEntries} />
            <HeaderStat label="Saved days" value={totalLoggedDays} />
          </div>
        </div>
      </section>

      {dayLogs.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-3">
          {dayLogs.map((dayLog) => {
            const entries = dayLog.entries || [];
            const totals = roundTotals(calculateTotals(entries));

            return (
              <HistoryDayCard
                key={dayLog.date}
                dayLog={dayLog}
                entries={entries}
                totals={totals}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeaderStat({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/10">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-2xl">
        🍽️
      </div>

      <p className="mt-4 font-black text-slate-950">No history yet</p>

      <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
        Add foods today and they will appear here automatically by date.
      </p>
    </div>
  );
}

function HistoryDayCard({ dayLog, entries, totals }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-base font-black tracking-tight text-slate-950">
            {formatDisplayDate(dayLog.date)}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {entries.length} item{entries.length === 1 ? "" : "s"} logged
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-right">
          <p className="text-lg font-black leading-none text-white">
            {totals.calories}
          </p>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
            kcal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <SmallStat
          label="Protein"
          value={totals.protein}
          className="bg-emerald-50 ring-1 ring-emerald-100"
          labelClassName="text-emerald-700"
          valueClassName="text-emerald-950"
        />

        <SmallStat
          label="Carbs"
          value={totals.carbs}
          className="bg-sky-50 ring-1 ring-sky-100"
          labelClassName="text-sky-700"
          valueClassName="text-sky-950"
        />

        <SmallStat
          label="Fat"
          value={totals.fat}
          className="bg-amber-50 ring-1 ring-amber-100"
          labelClassName="text-amber-700"
          valueClassName="text-amber-950"
        />
      </div>

      {entries.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Foods
          </p>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {entries.slice(0, 6).map((entry) => (
              <span
                key={entry.id}
                className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
              >
                {entry.foodName}
              </span>
            ))}

            {entries.length > 6 && (
              <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-600">
                +{entries.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function SmallStat({
  label,
  value,
  className = "bg-slate-50",
  labelClassName = "text-slate-400",
  valueClassName = "text-slate-800",
}) {
  return (
    <div className={`rounded-2xl p-3 ${className}`}>
      <p className={`text-[10px] font-black uppercase tracking-wide ${labelClassName}`}>
        {label}
      </p>

      <p className={`mt-1 text-sm font-black ${valueClassName}`}>
        {value}
        <span className="ml-0.5 text-xs font-bold opacity-70">g</span>
      </p>
    </div>
  );
}

export default HistoryPage;