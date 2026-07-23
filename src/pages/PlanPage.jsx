import { useMemo, useState } from "react";
import PlanSummaryCard from "../components/plan/PlanSummaryCard";
import MealGroup from "../components/today/MealGroup";
import {
  clearPlannedEntriesForDate,
  deleteEntryFromDate,
  getDayLog,
  getMealSettings,
  getPlannedEntries,
} from "../features/meals/mealStorage";
import {
  addDaysToDateKey,
  formatDisplayDate,
  getRelativeDateLabel,
  getTodayKey,
  getTomorrowKey,
  groupEntriesByMeal,
  MEAL_ORDER,
} from "../features/meals/mealHelpers";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";

function PlanPage({
  onOpenAddFood,
  selectedDateKey = getTomorrowKey(),
  onSelectedDateChange,
}) {
  const [dayLog, setDayLog] = useState(() => getDayLog(selectedDateKey));
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const entries = useMemo(() => {
    return getPlannedEntries(dayLog.entries);
  }, [dayLog.entries]);
  const targets = useMemo(() => getMealSettings(), []);
  const totals = useMemo(() => {
    return roundTotals(calculateTotals(entries));
  }, [entries]);
  const groupedEntries = useMemo(() => {
    return groupEntriesByMeal(entries);
  }, [entries]);

  const dateLabel = getRelativeDateLabel(selectedDateKey);
  const displayDate = formatDisplayDate(selectedDateKey);

  function refreshDate(dateKey) {
    if (!dateKey || dateKey < getTodayKey()) return;
    onSelectedDateChange?.(dateKey);
    setDayLog(getDayLog(dateKey));
    setShowClearConfirmation(false);
  }

  function handleAddPlannedFood(foodId = null, meal = null) {
    onOpenAddFood(foodId, null, selectedDateKey, "plan", "plan", meal);
  }

  function handleEdit(entry) {
    onOpenAddFood(entry.foodId, entry, selectedDateKey, "plan");
  }

  function handleDelete(entryId) {
    setDayLog(deleteEntryFromDate(entryId, selectedDateKey));
  }

  function handleClearPlan() {
    setDayLog(clearPlannedEntriesForDate(selectedDateKey));
    setShowClearConfirmation(false);
  }

  return (
    <div className="space-y-4">
      <PlanSummaryCard
        dateLabel={dateLabel}
        displayDate={displayDate}
        selectedDateKey={selectedDateKey}
        totals={totals}
        targets={targets}
        onPrevious={() =>
          refreshDate(addDaysToDateKey(selectedDateKey, -1))
        }
        onNext={() => refreshDate(addDaysToDateKey(selectedDateKey, 1))}
        onDateChange={(event) => refreshDate(event.target.value)}
        previousDisabled={selectedDateKey <= getTodayKey()}
      />

      <button
        type="button"
        onClick={() => handleAddPlannedFood()}
        className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-sm outline-none transition active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-indigo-200"
      >
        + Add food
      </button>

      <section className="space-y-3" aria-label="Planned meals">
        {MEAL_ORDER.map((meal) => (
          <MealGroup
            key={meal}
            title={meal}
            entries={groupedEntries[meal] || []}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAdd={() => handleAddPlannedFood(null, meal)}
            variant="plan"
          />
        ))}
      </section>

      {entries.length > 0 && (
        <section className="pt-2 text-center">
          {showClearConfirmation ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-left">
              <p className="font-black text-slate-950">
                Clear the plan for {dateLabel}?
              </p>
              <p className="mt-1 text-sm text-slate-500">
                This removes every planned item for this date.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirmation(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearPlan}
                  className="rounded-2xl bg-rose-600 px-3 py-2.5 text-sm font-black text-white"
                >
                  Clear plan
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirmation(true)}
              className="px-3 py-2 text-xs font-black text-slate-400 underline decoration-slate-300 underline-offset-4"
            >
              Clear this plan
            </button>
          )}
        </section>
      )}
    </div>
  );
}

export default PlanPage;
