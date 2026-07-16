import { calculateTotals, roundTotals } from "../../features/meals/nutrition";
import { getMealPlanTiming } from "../../features/meals/mealPlanHelpers";
import { MEAL_ORDER } from "../../features/meals/mealHelpers";

function PlannedMealsPanel({
  entries,
  settings,
  now,
  onConfirmMeal,
  onEditEntry,
  onSkipMeal,
}) {
  if (!entries.length) return null;

  const totals = roundTotals(calculateTotals(entries));

  return (
    <section className="rounded-[2rem] border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
            Today&apos;s plan
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            Confirm meals as you eat
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Planned food does not count toward today&apos;s totals until you
            confirm it.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
          <p className="text-lg font-black leading-none text-indigo-700">
            {totals.calories}
          </p>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-500">
            planned kcal
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {MEAL_ORDER.map((meal) => {
          const mealEntries = entries.filter((entry) => entry.meal === meal);
          if (!mealEntries.length) return null;

          const timing = getMealPlanTiming(meal, settings, now);

          return (
            <article
              key={meal}
              className={`rounded-3xl border bg-white p-3 shadow-sm ${
                timing.isDue ? "border-amber-200" : "border-indigo-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{meal}</h3>
                  <p
                    className={`mt-0.5 text-xs font-bold ${
                      timing.isDue ? "text-amber-700" : "text-indigo-500"
                    }`}
                  >
                    {timing.label}
                  </p>
                </div>
                {timing.isDue && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                    Due
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {mealEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onEditEntry(entry)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 text-left outline-none transition active:bg-slate-100 focus-visible:ring-4 focus-visible:ring-indigo-100"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-slate-800">
                        {entry.foodName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
                        {entry.servingText}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-black text-indigo-600">
                      Change
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  onClick={() => onConfirmMeal(meal)}
                  className="rounded-2xl bg-indigo-600 px-3 py-2.5 text-sm font-black text-white shadow-sm outline-none active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-indigo-200"
                >
                  Ate as planned
                </button>
                <button
                  type="button"
                  onClick={() => onSkipMeal(meal)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-500 outline-none active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Skip
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PlannedMealsPanel;
