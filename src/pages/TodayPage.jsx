import { useMemo, useState } from "react";
import { getAllFoods, getFoodById } from "../data/foods";
import TodaySummaryCard from "../components/today/TodaySummaryCard";
import QuickAddStrip from "../components/today/QuickAddStrip";
import MealGroup from "../components/today/MealGroup";
import InstallAppButton from "../components/ui/InstallAppButton";
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
      return getAllFoods().slice(0, 6);
    }

    return ids.map(getFoodById).filter(Boolean).slice(0, 6);
  }, [entries]);

  function handleDelete(entryId) {
    const updatedDayLog = deleteEntryFromDate(entryId, dayLog.date);
    setDayLog(updatedDayLog);
  }

  return (
    <div className="space-y-5">
      <TodaySummaryCard totals={totals} onAddFood={() => onOpenAddFood()} />
<InstallAppButton />
      <QuickAddStrip foods={quickFoods} onSelectFood={onOpenAddFood} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="mb-4 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ">
  <div className="flex w-full items-start justify-between gap-3 ">
    <div className="min-w-0 flex-1">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
        Today’s log
      </p>

      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        Meals
      </h2>

      <p className="mt-1 text-sm font-medium text-slate-500">
        Track what you have eaten today.
      </p>
    </div>

    <div className="shrink-0 rounded-2xl bg-emerald-50 px-3 py-2 text-center">
      <p className="text-lg font-black leading-none text-emerald-700">
        {entries.length}
      </p>
      <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
        item{entries.length === 1 ? "" : "s"}
      </p>
    </div>
  </div>
</div>
  

         
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
