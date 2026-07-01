import { useMemo, useState } from "react";
import { foods } from "../data/foods";
import TodaySummaryCard from "../components/today/TodaySummaryCard";
import QuickAddStrip from "../components/today/QuickAddStrip";
import MealGroup from "../components/today/MealGroup";
import {
  deleteEntryFromDate,
  getAllDays,
  getTodayLog,
} from "../features/meals/mealStorage";
import {
  getFrequentFoodIds,
  getRecentFoodIds,
  groupEntriesByMeal,
  MEAL_ORDER,
} from "../features/meals/mealHelpers";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";

function TodayPage({ onOpenAddFood }) {
  const [dayLog, setDayLog] = useState(() => getTodayLog());

  const entries = dayLog.entries || [];

  const totals = useMemo(() => {
    return roundTotals(calculateTotals(entries));
  }, [entries]);

  const groupedEntries = useMemo(() => {
    return groupEntriesByMeal(entries);
  }, [entries]);

  const quickFoods = useMemo(() => {
    const days = getAllDays();
    const recentIds = getRecentFoodIds(days, 5);
    const frequentIds = getFrequentFoodIds(days, 5);

    const ids = [...new Set([...recentIds, ...frequentIds])];

    if (ids.length === 0) {
      return foods.slice(0, 6);
    }

    return ids
      .map((foodId) => foods.find((food) => food.id === foodId))
      .filter(Boolean)
      .slice(0, 6);
  }, [entries]);

  function handleDelete(entryId) {
    const updatedDayLog = deleteEntryFromDate(entryId, dayLog.date);
    setDayLog(updatedDayLog);
  }

  return (
    <div className="space-y-5">
      <TodaySummaryCard totals={totals} onAddFood={() => onOpenAddFood()} />

      <QuickAddStrip foods={quickFoods} onSelectFood={onOpenAddFood} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Meals
            </h2>
            <p className="text-sm text-slate-500">
              {entries.length} item{entries.length === 1 ? "" : "s"} logged
              today
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenAddFood()}
            className="rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm active:scale-[0.98]"
          >
            Add
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm">
            <p className="text-lg font-black text-slate-950">
              Start tracking today
            </p>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
              Add what you ate. The app will calculate calories, protein, carbs
              and fat.
            </p>

            <button
              type="button"
              onClick={() => onOpenAddFood()}
              className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98]"
            >
              Add First Food
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {MEAL_ORDER.map((meal) => (
              <MealGroup
                key={meal}
                title={meal}
                entries={groupedEntries[meal] || []}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TodayPage;
