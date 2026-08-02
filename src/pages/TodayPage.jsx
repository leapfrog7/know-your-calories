import { useEffect, useMemo, useState } from "react";
import { getAllFoods, getFoodById } from "../data/foods";
import TodaySummaryCard from "../components/today/TodaySummaryCard";
import QuickAddStrip from "../components/today/QuickAddStrip";
import MealGroup from "../components/today/MealGroup";
import InstallAppButton from "../components/ui/InstallAppButton";
import BackupReminder from "../components/today/BackupReminder";
import PlannedMealsPanel from "../components/today/PlannedMealsPanel";
import HydrationCard from "../components/today/HydrationCard";
import {
  addWaterToDate,
  deleteEntryFromDate,
  getAllDays,
  getConsumedEntries,
  getMealSettings,
  getPlannedEntries,
  getTodayLog,
  updatePlannedMealStatus,
  undoLastWaterEntry,
} from "../features/meals/mealStorage";
import {
  getFrequentFoodIds,
  getRecentFoodIds,
  getTodayKey,
  groupEntriesByMeal,
  MEAL_ORDER,
} from "../features/meals/mealHelpers";
import { calculateTotals, roundTotals } from "../features/meals/nutrition";
import {
  downloadBackupFile,
  getBackupReminderStatus,
  snoozeBackupReminder,
} from "../features/backup/backupHelpers";

function TodayPage({ onOpenAddFood }) {
  const [dayLog, setDayLog] = useState(() => getTodayLog());
  const [backupReminder, setBackupReminder] = useState(() => {
    return getBackupReminderStatus();
  });
  const [now, setNow] = useState(() => new Date());

  const entries = useMemo(() => {
    return getConsumedEntries(dayLog.entries);
  }, [dayLog.entries]);
  const plannedEntries = useMemo(() => {
    return getPlannedEntries(dayLog.entries);
  }, [dayLog.entries]);

  const settings = useMemo(() => getMealSettings(), []);

  useEffect(() => {
    function refreshTime() {
      setNow(new Date());
      if (dayLog.date !== getTodayKey()) {
        setDayLog(getTodayLog());
      }
    }

    const intervalId = window.setInterval(refreshTime, 60 * 1000);
    document.addEventListener("visibilitychange", refreshTime);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshTime);
    };
  }, [dayLog.date]);

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

  function handleEdit(entry) {
    onOpenAddFood(entry.foodId, entry);
  }

  function handleEditPlannedEntry(entry) {
    onOpenAddFood(entry.foodId, entry, dayLog.date, "plan", "today");
  }

  function handleConfirmPlannedMeal(meal) {
    setDayLog(updatePlannedMealStatus(meal, "consumed", dayLog.date));
  }

  function handleSkipPlannedMeal(meal) {
    setDayLog(updatePlannedMealStatus(meal, "skipped", dayLog.date));
  }

  function handleAddWater(amountMl) {
    setDayLog(addWaterToDate(amountMl, dayLog.date));
  }

  function handleUndoWater() {
    setDayLog(undoLastWaterEntry(dayLog.date));
  }

  function handleBackupNow() {
    const lastBackupAt = downloadBackupFile();
    setBackupReminder({ shouldShow: false, lastBackupAt });
  }

  function handleBackupLater() {
    snoozeBackupReminder();
    setBackupReminder((current) => ({ ...current, shouldShow: false }));
  }

  return (
    <div className="space-y-5">
      <TodaySummaryCard totals={totals} targets={settings} />

      <HydrationCard
        waterEntries={dayLog.waterEntries || []}
        targetMl={settings.defaultWaterTargetMl}
        quickAddMl={settings.defaultWaterQuickAddMl}
        dayStart={settings.hydrationDayStart}
        dayEnd={settings.hydrationDayEnd}
        now={now}
        onAdd={handleAddWater}
        onUndo={handleUndoWater}
      />

      <InstallAppButton />

      {backupReminder.shouldShow && (
        <BackupReminder
          lastBackupAt={backupReminder.lastBackupAt}
          onBackup={handleBackupNow}
          onSnooze={handleBackupLater}
        />
      )}

      <PlannedMealsPanel
        entries={plannedEntries}
        settings={settings}
        now={now}
        onConfirmMeal={handleConfirmPlannedMeal}
        onEditEntry={handleEditPlannedEntry}
        onSkipMeal={handleSkipPlannedMeal}
      />

      <QuickAddStrip foods={quickFoods} onSelectFood={onOpenAddFood} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="text-lg font-black tracking-tight text-slate-950">Meals</h2>
          <p className="text-xs font-bold text-slate-400">{entries.length} item{entries.length === 1 ? "" : "s"}</p>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-6 text-center">
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
          <div className="overflow-visible rounded-3xl border border-slate-200 bg-white px-5 shadow-sm">
            {MEAL_ORDER.map((meal) => (
              <MealGroup
                key={meal}
                title={meal}
                entries={groupedEntries[meal] || []}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TodayPage;
