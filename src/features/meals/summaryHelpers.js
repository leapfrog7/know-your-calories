import { getFoodById } from "../../data/foods";
import { calculateTotals, roundTotals } from "./nutrition";

const MEALS = ["Breakfast", "Lunch", "Evening Snack", "Dinner", "Other"];

export function buildPeriodSummary(days = {}, mode = "week", targets = {}) {
  const range = getPeriodRange(mode);
  const previousRange = getPreviousPeriodRange(range, mode);
  const targetValues = {
    calorieTarget: Number(targets.defaultCalorieTarget) || 2000,
    proteinTarget: Number(targets.defaultProteinTarget) || 80,
    waterTarget: Number(targets.defaultWaterTargetMl) || 2000,
  };
  const current = buildRangeSummary(days, range, mode, targetValues);
  const previous = buildRangeSummary(days, previousRange, mode, targetValues);
  const streak = getCurrentLoggingStreak(days);

  return {
    ...current,
    mode,
    targets: targetValues,
    previous: {
      averages: previous.averages,
      loggedDayCount: previous.loggedDayCount,
      averageWaterMl: previous.averageWaterMl,
    },
    comparisons: {
      calories: current.averages.calories - previous.averages.calories,
      protein: Number((current.averages.protein - previous.averages.protein).toFixed(1)),
      water: current.averageWaterMl - previous.averageWaterMl,
      loggedDays: current.loggedDayCount - previous.loggedDayCount,
      hasPreviousData: previous.loggedDayCount > 0 || previous.waterLoggedDayCount > 0,
    },
    streak,
    insights: buildInsights(current, targetValues, streak),
  };
}

function buildRangeSummary(days, range, mode, targets) {
  const dateKeys = getDatesBetween(range.startDate, range.endDate);
  const dailyRows = dateKeys.map((dateKey) => {
    const entries = (days[dateKey]?.entries || []).filter(
      (entry) => entry.status !== "planned" && entry.status !== "skipped",
    );
    return {
      date: dateKey,
      label: getDayLabel(dateKey, mode),
      entries,
      totals: roundTotals(calculateTotals(entries)),
      hasLog: entries.length > 0,
      waterMl: (days[dateKey]?.waterEntries || []).reduce(
        (total, entry) => total + (Number(entry.amountMl) || 0),
        0,
      ),
    };
  });

  const loggedDays = dailyRows.filter((day) => day.hasLog);
  const waterDays = dailyRows.filter((day) => day.waterMl > 0);
  const periodTotals = roundTotals(calculateTotals(loggedDays.flatMap((day) => day.entries)));
  const averages = getAverages(periodTotals, loggedDays.length);
  const averageWaterMl = waterDays.length
    ? Math.round(waterDays.reduce((total, day) => total + day.waterMl, 0) / waterDays.length)
    : 0;
  const mealCalories = getMealCalories(loggedDays);

  return {
    startDate: getDateKey(range.startDate),
    endDate: getDateKey(range.endDate),
    totalDays: dailyRows.length,
    loggedDayCount: loggedDays.length,
    waterLoggedDayCount: waterDays.length,
    periodTotals,
    averages,
    averageWaterMl,
    dailyRows,
    mostLoggedFoods: getMostLoggedFoods(loggedDays),
    calorieImpactFoods: getMostLoggedFoods(loggedDays, 5, "calories"),
    mealCalories,
    daysNearCalorieTarget: loggedDays.filter(
      (day) => Math.abs(day.totals.calories - targets.calorieTarget) <= targets.calorieTarget * 0.1,
    ).length,
    proteinTargetDays: loggedDays.filter((day) => day.totals.protein >= targets.proteinTarget).length,
    hydratedDays: dailyRows.filter((day) => day.waterMl >= targets.waterTarget).length,
  };
}

function getAverages(totals, count) {
  if (!count) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  return {
    calories: Math.round(totals.calories / count),
    protein: Number((totals.protein / count).toFixed(1)),
    carbs: Number((totals.carbs / count).toFixed(1)),
    fat: Number((totals.fat / count).toFixed(1)),
  };
}

function getMostLoggedFoods(loggedDays, limit = 5, sortBy = "count") {
  const foods = {};
  loggedDays.forEach((day) => day.entries.forEach((entry) => {
    if (!entry.foodId) return;
    foods[entry.foodId] = {
      foodId: entry.foodId,
      count: (foods[entry.foodId]?.count || 0) + 1,
      calories: (foods[entry.foodId]?.calories || 0) + (Number(entry.calories) || 0),
    };
  }));
  return Object.values(foods)
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, limit)
    .map((item) => {
      const food = getFoodById(item.foodId);
      return { ...item, name: food?.shortName || food?.name || item.foodId };
    });
}

function getMealCalories(loggedDays) {
  const totals = Object.fromEntries(MEALS.map((meal) => [meal, 0]));
  loggedDays.forEach((day) => day.entries.forEach((entry) => {
    const meal = MEALS.includes(entry.meal) ? entry.meal : "Other";
    totals[meal] += Number(entry.calories) || 0;
  }));
  return totals;
}

function buildInsights(summary, targets, streak) {
  if (summary.loggedDayCount < 3) {
    return [{ icon: "📈", title: "Keep logging", text: "Log at least three days to unlock reliable pattern insights." }];
  }

  const insights = [];
  const calorieDifference = summary.averages.calories - targets.calorieTarget;
  insights.push({
    icon: "🎯",
    title: "Calorie pattern",
    text: Math.abs(calorieDifference) <= targets.calorieTarget * 0.1
      ? `Your average is within 10% of your ${targets.calorieTarget} kcal target.`
      : `Your average is ${Math.abs(calorieDifference)} kcal ${calorieDifference > 0 ? "above" : "below"} your target.`,
  });

  const topMeal = Object.entries(summary.mealCalories).sort((a, b) => b[1] - a[1])[0];
  const totalMealCalories = Object.values(summary.mealCalories).reduce((total, value) => total + value, 0);
  if (topMeal?.[1] > 0 && totalMealCalories > 0) {
    const share = Math.round((topMeal[1] / totalMealCalories) * 100);
    insights.push({ icon: "🍽️", title: "Meal balance", text: `${topMeal[0]} contributes ${share}% of calories logged in this period.` });
  }

  if (streak >= 2) {
    insights.push({ icon: "🔥", title: "Logging streak", text: `You have logged food for ${streak} consecutive days.` });
  } else {
    const proteinRate = Math.round((summary.proteinTargetDays / summary.loggedDayCount) * 100);
    insights.push({ icon: "💪", title: "Protein consistency", text: `You reached your protein target on ${proteinRate}% of logged days.` });
  }
  return insights.slice(0, 3);
}

function getCurrentLoggingStreak(days) {
  let streak = 0;
  const date = new Date();
  while (true) {
    const key = getDateKey(date);
    const hasEntries = (days[key]?.entries || []).some(
      (entry) => entry.status !== "planned" && entry.status !== "skipped",
    );
    if (!hasEntries) break;
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function getPeriodRange(mode) {
  const now = new Date();
  return {
    startDate: mode === "month" ? new Date(now.getFullYear(), now.getMonth(), 1) : getStartOfWeek(now),
    endDate: now,
  };
}

function getPreviousPeriodRange(range, mode) {
  const elapsedDays = Math.round((range.endDate - range.startDate) / 86400000);
  const startDate = mode === "month"
    ? new Date(range.startDate.getFullYear(), range.startDate.getMonth() - 1, 1)
    : addDays(range.startDate, -7);
  const naturalEnd = addDays(startDate, elapsedDays);
  const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate: naturalEnd > monthEnd ? monthEnd : naturalEnd };
}

function getStartOfWeek(date) {
  const current = new Date(date);
  const day = current.getDay();
  current.setDate(current.getDate() + (day === 0 ? -6 : 1 - day));
  current.setHours(0, 0, 0, 0);
  return current;
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  while (current <= end) {
    dates.push(getDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getDayLabel(dateKey, mode) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", mode === "week" ? { weekday: "short" } : { day: "numeric" });
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
