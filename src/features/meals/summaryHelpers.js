import { getFoodById } from "../../data/foods";
import { calculateTotals, roundTotals } from "./nutrition";

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getStartOfWeek(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  current.setDate(current.getDate() + diffToMonday);
  current.setHours(0, 0, 0, 0);

  return current;
}

function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date);
  const end = new Date(start);

  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return end;
}

function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(getDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function getDayLabel(dateKey, mode) {
  const date = parseDateKey(dateKey);

  if (mode === "week") {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getPeriodRange(mode) {
  const now = new Date();

  if (mode === "month") {
    return {
      startDate: getStartOfMonth(now),
      endDate: getEndOfMonth(now),
    };
  }

  return {
    startDate: getStartOfWeek(now),
    endDate: getEndOfWeek(now),
  };
}

function getMostLoggedFoods(loggedDays, limit = 5) {
  const counts = {};

  loggedDays.forEach((day) => {
    day.entries.forEach((entry) => {
      if (!entry.foodId) return;

      counts[entry.foodId] = {
        foodId: entry.foodId,
        count: (counts[entry.foodId]?.count || 0) + 1,
       calories:
  (counts[entry.foodId]?.calories || 0) + (Number(entry.calories) || 0),
      };
    });
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => {
     const food = getFoodById(item.foodId);

return {
  ...item,
  name: food?.shortName || food?.name || item.foodId,
};
    });
}

export function buildPeriodSummary(days = {}, mode = "week") {
  const { startDate, endDate } = getPeriodRange(mode);
  const dateKeys = getDatesBetween(startDate, endDate);

  const dailyRows = dateKeys.map((dateKey) => {
    const entries = (days[dateKey]?.entries || []).filter((entry) => {
      return entry.status !== "planned" && entry.status !== "skipped";
    });
    const totals = roundTotals(calculateTotals(entries));

    return {
      date: dateKey,
      label: getDayLabel(dateKey, mode),
      entries,
      totals,
      hasLog: entries.length > 0,
    };
  });

  const loggedDays = dailyRows.filter((day) => day.hasLog);
  const loggedDayCount = loggedDays.length;

  const periodTotals = roundTotals(
    calculateTotals(loggedDays.flatMap((day) => day.entries)),
  );

  const averages =
    loggedDayCount > 0
      ? {
          calories: Math.round(periodTotals.calories / loggedDayCount),
          protein: Number((periodTotals.protein / loggedDayCount).toFixed(1)),
          carbs: Number((periodTotals.carbs / loggedDayCount).toFixed(1)),
          fat: Number((periodTotals.fat / loggedDayCount).toFixed(1)),
        }
      : {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };

  const highestDay =
    loggedDays.length > 0
      ? [...loggedDays].sort((a, b) => b.totals.calories - a.totals.calories)[0]
      : null;

  const maxCalories = Math.max(
    ...dailyRows.map((day) => day.totals.calories),
    1,
  );

  const mostLoggedFoods = getMostLoggedFoods(loggedDays);

  return {
    mode,
    startDate: getDateKey(startDate),
    endDate: getDateKey(endDate),
    totalDays: dailyRows.length,
    loggedDayCount,
    periodTotals,
    averages,
    highestDay,
    dailyRows,
    maxCalories,
    mostLoggedFoods,
  };
}
