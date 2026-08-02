function TodaySummaryCard({ totals, targets }) {
  const calorieTarget = targets?.defaultCalorieTarget || 2000;
  const proteinTarget = targets?.defaultProteinTarget || 80;
  const caloriePercent = getPercent(totals.calories, calorieTarget);
  const caloriesLeft = calorieTarget - totals.calories;

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
              Today
            </p>
            <p className="mt-1 text-4xl font-black tracking-tight">
              {totals.calories}
              <span className="ml-1 text-sm text-slate-400">kcal</span>
            </p>
          </div>
          <div className="pt-1 text-right">
            <p className={`text-lg font-black ${caloriesLeft < 0 ? "text-amber-300" : "text-white"}`}>
              {Math.abs(caloriesLeft)}
            </p>
            <p className="text-xs font-semibold text-slate-400">
              kcal {caloriesLeft < 0 ? "over" : "left"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Daily calorie progress"
            aria-valuemin="0"
            aria-valuemax={calorieTarget}
            aria-valuenow={Math.min(totals.calories, calorieTarget)}
          >
            <div
              className={`h-full rounded-full ${caloriesLeft < 0 ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ width: `${Math.min(caloriePercent, 100)}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-black text-slate-300">
            {caloriePercent}%
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-4">
          <MacroStat label="Protein" value={totals.protein} target={proteinTarget} tone="text-emerald-300" />
          <MacroStat label="Carbs" value={totals.carbs} tone="text-sky-300" />
          <MacroStat label="Fat" value={totals.fat} tone="text-amber-300" />
        </div>
      </div>
    </section>
  );
}

function MacroStat({ label, value, target, tone }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-black ${tone}`}>
        {Number(value).toFixed(1)}g
        {target ? <span className="ml-1 text-[10px] text-slate-500">/ {target}g</span> : null}
      </p>
    </div>
  );
}

function getPercent(value, target) {
  if (!target || target <= 0) return 0;
  return Math.round((Number(value || 0) / Number(target)) * 100);
}

export default TodaySummaryCard;
