function PlanSummaryCard({ dateLabel, displayDate, totals, targets }) {
  const calorieTarget = targets?.defaultCalorieTarget || 2000;
  const proteinTarget = targets?.defaultProteinTarget || 80;

  const caloriesLeft = Math.max(0, calorieTarget - totals.calories);
  const proteinLeft = Math.max(
    0,
    Number((proteinTarget - totals.protein).toFixed(1)),
  );

  const caloriePercent = getPercent(totals.calories, calorieTarget);
  const proteinPercent = getPercent(totals.protein, proteinTarget);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-12 h-36 w-36 rounded-full bg-sky-200/50 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-indigo-100">
              <span className="text-xs" aria-hidden="true">
                📅
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-700">
                Meal plan
              </p>
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {dateLabel}
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {displayDate}
            </p>
          </div>

          <div className="shrink-0 rounded-3xl bg-white/80 px-4 py-3 text-center shadow-sm ring-1 ring-indigo-100">
            <p className="text-2xl font-black leading-none text-indigo-700">
              {totals.calories}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-indigo-500">
              planned kcal
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <PlanMetric
            label="Calories"
            value={totals.calories}
            target={calorieTarget}
            leftText={`${caloriesLeft} kcal left`}
            percent={caloriePercent}
          />

          <PlanMetric
            label="Protein"
            value={Number(totals.protein.toFixed(1))}
            target={proteinTarget}
            leftText={`${proteinLeft}g left`}
            percent={proteinPercent}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MacroBox label="Protein" value={`${totals.protein.toFixed(1)}g`} />
          <MacroBox label="Carbs" value={`${totals.carbs.toFixed(1)}g`} />
          <MacroBox label="Fat" value={`${totals.fat.toFixed(1)}g`} />
        </div>

        <p className="mt-4 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold leading-relaxed text-slate-500 ring-1 ring-indigo-100/70">
          This is a flexible meal plan. Change items freely before the day
          starts.
        </p>
      </div>
    </section>
  );
}

function PlanMetric({ label, value, target, leftText, percent }) {
  return (
    <div className="rounded-3xl bg-white/80 p-3 shadow-sm ring-1 ring-indigo-100">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-slate-950">
            {value}
            <span className="ml-1 text-xs font-bold text-slate-400">
              / {target}
            </span>
          </p>
        </div>

        <p className="shrink-0 text-xs font-black text-indigo-600">
          {percent}%
        </p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] font-bold text-slate-500">{leftText}</p>
    </div>
  );
}

function MacroBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/75 px-3 py-2 shadow-sm ring-1 ring-indigo-100/80">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function getPercent(value, target) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.round((Number(value || 0) / Number(target)) * 100);
}

export default PlanSummaryCard;