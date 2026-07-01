import MacroPill from "../ui/MacroPill";

function TodaySummaryCard({ totals, onAddFood }) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-300">Today</p>
          <h2 className="mt-1 text-4xl font-black tracking-tight">
            {totals.calories}
            <span className="ml-1 text-base font-bold text-slate-400">
              kcal
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">Consumed so far</p>
        </div>

        <button
          type="button"
          onClick={onAddFood}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm active:scale-[0.98]"
        >
          + Food
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <MacroPill label="Protein" value={totals.protein.toFixed(1)} unit="g" />
        <MacroPill label="Carbs" value={totals.carbs.toFixed(1)} unit="g" />
        <MacroPill label="Fat" value={totals.fat.toFixed(1)} unit="g" />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Values are approximate and may vary by recipe, oil/ghee used and portion
        size.
      </p>
    </section>
  );
}

export default TodaySummaryCard;
