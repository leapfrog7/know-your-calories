import { useMemo, useState } from "react";
import { getAllFoods, getFoodById } from "../data/foods";
import PlanSummaryCard from "../components/plan/PlanSummaryCard";
import QuickAddStrip from "../components/today/QuickAddStrip";
import MealGroup from "../components/today/MealGroup";
import {
  clearEntriesForDate,
  deleteEntryFromDate,
  getAllDays,
  getDayLog,
  getMealSettings,
} from "../features/meals/mealStorage";
import {
  addDaysToDateKey,
  formatDisplayDate,
  getFrequentFoodIds,
  getRecentFoodIds,
  getRelativeDateLabel,
  getTomorrowKey,
  groupEntriesByMeal,
  MEAL_ORDER,
} from "../features/meals/mealHelpers";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";

function PlanPage({ onOpenAddFood }) {
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getTomorrowKey(),
  );
  const [dayLog, setDayLog] = useState(() => getDayLog(getTomorrowKey()));

  const entries = dayLog.entries || [];

  const targets = useMemo(() => getMealSettings(), []);

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

  const dateLabel = getRelativeDateLabel(selectedDateKey);
  const displayDate = formatDisplayDate(selectedDateKey);

  function refreshDate(dateKey) {
    setSelectedDateKey(dateKey);
    setDayLog(getDayLog(dateKey));
  }

  function handlePreviousDay() {
    refreshDate(addDaysToDateKey(selectedDateKey, -1));
  }

  function handleNextDay() {
    refreshDate(addDaysToDateKey(selectedDateKey, 1));
  }

  function handleTomorrow() {
    refreshDate(getTomorrowKey());
  }

  function handleDateInputChange(event) {
    refreshDate(event.target.value);
  }

  function handleAddPlannedFood(foodId = null) {
    onOpenAddFood(foodId, null, selectedDateKey, "plan");
  }

  function handleEdit(entry) {
    onOpenAddFood(entry.foodId, entry, selectedDateKey, "plan");
  }

  function handleDelete(entryId) {
    const updatedDayLog = deleteEntryFromDate(entryId, selectedDateKey);
    setDayLog(updatedDayLog);
  }

  function handleClearPlan() {
    const updatedDayLog = clearEntriesForDate(selectedDateKey);
    setDayLog(updatedDayLog);
  }

  return (
    <div className="space-y-5">
      <PlanSummaryCard
        dateLabel={dateLabel}
        displayDate={displayDate}
        totals={totals}
        targets={targets}
      />

      <section className="rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
              Planning date
            </p>

            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              {dateLabel}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Select the day you want to plan.
            </p>
          </div>

          <input
            type="date"
            value={selectedDateKey}
            onChange={handleDateInputChange}
            className="shrink-0 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-700 outline-none"
            aria-label="Select planning date"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <DateButton label="Previous" onClick={handlePreviousDay} />
          <DateButton label="Tomorrow" onClick={handleTomorrow} />
          <DateButton label="Next" onClick={handleNextDay} />
        </div>
      </section>

      <QuickAddStrip foods={quickFoods} onSelectFood={handleAddPlannedFood} />

      <section>
        <div className="mb-4 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Planned meals
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                Breakfast, lunch and dinner
              </h2>

              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                Draft the day first. Edit or clear it whenever the plan changes.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-indigo-100 px-3 py-2 text-center">
              <p className="text-lg font-black leading-none text-indigo-700">
                {entries.length}
              </p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-600">
                item{entries.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAddPlannedFood()}
              className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-sm transition active:scale-[0.98]"
            >
              + Add to plan
            </button>

            <button
              type="button"
              onClick={handleClearPlan}
              disabled={entries.length === 0}
              className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-black text-indigo-700 shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear plan
            </button>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-indigo-200 bg-indigo-50/50 p-7 text-center shadow-sm">
            <p className="text-3xl">🗓️</p>

            <p className="mt-3 text-lg font-black text-slate-950">
              No meals planned yet
            </p>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
              Add breakfast, lunch, dinner or snacks to estimate tomorrow’s
              calories in advance.
            </p>

            <button
              type="button"
              onClick={() => handleAddPlannedFood()}
              className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98]"
            >
              Plan First Meal
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
                onEdit={handleEdit}
                variant="plan"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DateButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-indigo-50 px-3 py-2.5 text-xs font-black text-indigo-700 transition active:scale-[0.98] active:bg-indigo-100"
    >
      {label}
    </button>
  );
}

export default PlanPage;