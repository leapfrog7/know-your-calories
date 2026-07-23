function PlanSummaryCard({
  dateLabel,
  displayDate,
  selectedDateKey,
  totals,
  targets,
  onPrevious,
  onNext,
  onDateChange,
  previousDisabled,
}) {
  const calorieTarget = targets?.defaultCalorieTarget || 2000;
  const proteinTarget = targets?.defaultProteinTarget || 80;
  const calorieDifference = calorieTarget - totals.calories;
  const proteinDifference = Number(
    (proteinTarget - totals.protein).toFixed(1),
  );

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <DateArrow
          label="Previous planning day"
          symbol="‹"
          onClick={onPrevious}
          disabled={previousDisabled}
        />

        <label className="relative min-w-0 flex-1 cursor-pointer rounded-2xl bg-indigo-50 px-3 py-2 text-center outline-none focus-within:ring-4 focus-within:ring-indigo-100">
          <span className="block truncate text-base font-black text-slate-950">
            {dateLabel}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-indigo-600">
            {displayDate}
          </span>
          <input
            type="date"
            min={getTodayDateKey()}
            value={selectedDateKey}
            onChange={onDateChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Select planning date"
          />
        </label>

        <DateArrow
          label="Next planning day"
          symbol="›"
          onClick={onNext}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <PlanTotal
          label="Calories"
          value={`${totals.calories} / ${calorieTarget}`}
          difference={formatDifference(calorieDifference, "kcal")}
          progress={getPercent(totals.calories, calorieTarget)}
        />
        <PlanTotal
          label="Protein"
          value={`${totals.protein.toFixed(1)} / ${proteinTarget}g`}
          difference={formatDifference(proteinDifference, "g")}
          progress={getPercent(totals.protein, proteinTarget)}
        />
      </div>

      {(totals.carbs > 0 || totals.fat > 0) && (
        <p className="mt-3 text-center text-xs font-semibold text-slate-400">
          Carbs {totals.carbs.toFixed(1)}g · Fat {totals.fat.toFixed(1)}g
        </p>
      )}
    </section>
  );
}

function DateArrow({ label, symbol, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-black text-indigo-700 outline-none transition active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {symbol}
    </button>
  );
}

function PlanTotal({ label, value, difference, progress }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-black text-slate-950">
            {value}
          </p>
        </div>
        <p
          className={`shrink-0 text-[10px] font-black ${
            difference.isOver ? "text-rose-600" : "text-indigo-600"
          }`}
        >
          {difference.text}
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${
            difference.isOver ? "bg-rose-500" : "bg-indigo-500"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatDifference(difference, unit) {
  const absoluteDifference = Math.abs(difference);

  return {
    isOver: difference < 0,
    text:
      difference < 0
        ? `${absoluteDifference}${unit} over`
        : `${absoluteDifference}${unit} left`,
  };
}

function getPercent(value, target) {
  if (!target || target <= 0) return 0;
  return Math.round((Number(value || 0) / Number(target)) * 100);
}

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default PlanSummaryCard;
