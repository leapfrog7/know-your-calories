import MacroPill from "../ui/MacroPill";

function TodaySummaryCard({ totals, targets }) {
  const calorieTarget = targets?.defaultCalorieTarget || 2000;
  const proteinTarget = targets?.defaultProteinTarget || 80;

  const caloriePercent = getPercent(totals.calories, calorieTarget);
  const proteinPercent = getPercent(totals.protein, proteinTarget);

  const caloriesLeft = Math.max(0, calorieTarget - totals.calories);
  const proteinLeft = Math.max(
    0,
    Number((proteinTarget - totals.protein).toFixed(1)),
  );

  return (
    <section className="relative w-full overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />

      <div className="relative">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Today’s intake
          </p>

          <h2 className="mt-2 flex items-end gap-1 text-5xl font-black tracking-tight">
            {totals.calories}
            <span className="mb-1 text-base font-black text-slate-400">
              kcal
            </span>
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-400">
            {totals.calories} / {calorieTarget} kcal target
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <TargetProgress
            label="Calories"
            value={totals.calories}
            target={calorieTarget}
            percent={caloriePercent}
            leftText={`${caloriesLeft} kcal left`}
            barClassName="bg-emerald-400"
          />

          <TargetProgress
            label="Protein"
            value={Number(totals.protein.toFixed(1))}
            target={proteinTarget}
            percent={proteinPercent}
            leftText={`${proteinLeft}g left`}
            barClassName="bg-sky-400"
          />
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Macros
            </p>

            <p className="text-xs font-bold text-slate-500">grams</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MacroPill
              label="💪 Protein"
              value={totals.protein.toFixed(1)}
              unit="g"
              className="border-emerald-400/20 bg-emerald-400/10"
              labelClassName="text-emerald-300"
              valueClassName="text-emerald-50"
              unitClassName="text-emerald-200/70"
            />

            <MacroPill
              label="🍞 Carbs"
              value={totals.carbs.toFixed(1)}
              unit="g"
              className="border-sky-400/20 bg-sky-400/10"
              labelClassName="text-sky-300"
              valueClassName="text-sky-50"
              unitClassName="text-sky-200/70"
            />

            <MacroPill
              label="🧀 Fat"
              value={totals.fat.toFixed(1)}
              unit="g"
              className="border-amber-400/20 bg-amber-400/10"
              labelClassName="text-amber-300"
              valueClassName="text-amber-50"
              unitClassName="text-amber-200/70"
            />
          </div>
        </div>

        <p className="mt-4 rounded-2xl bg-white/5 px-3 py-2 text-xs leading-relaxed text-slate-400">
          Approximate values. Calories may vary by recipe, oil/ghee used and
          portion size.
        </p>
      </div>
    </section>
  );
}

function TargetProgress({
  label,
  value,
  target,
  percent,
  leftText,
  barClassName,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-white">
            {value}
            <span className="ml-1 text-xs font-bold text-slate-500">
              / {target}
            </span>
          </p>
        </div>

        <p className="shrink-0 text-xs font-black text-emerald-300">
          {percent}%
        </p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] font-bold text-slate-500">{leftText}</p>
    </div>
  );
}

function getPercent(value, target) {
  if (!target || target <= 0) return 0;

  return Math.round((Number(value || 0) / Number(target)) * 100);
}

export default TodaySummaryCard;
