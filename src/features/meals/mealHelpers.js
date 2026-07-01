export const MEAL_ORDER = [
  "Breakfast",
  "Lunch",
  "Evening Snack",
  "Dinner",
  "Other",
];

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDefaultMealByTime(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return "Breakfast";
  }

  if (hour >= 11 && hour < 16) {
    return "Lunch";
  }

  if (hour >= 16 && hour < 19) {
    return "Evening Snack";
  }

  if (hour >= 19 && hour < 24) {
    return "Dinner";
  }

  return "Other";
}

export function groupEntriesByMeal(entries = []) {
  return MEAL_ORDER.reduce((groups, meal) => {
    groups[meal] = entries.filter((entry) => entry.meal === meal);
    return groups;
  }, {});
}

export function getFrequentFoodIds(days = {}, limit = 8) {
  const counts = {};

  Object.values(days).forEach((dayLog) => {
    const entries = dayLog?.entries || [];

    entries.forEach((entry) => {
      if (!entry.foodId) return;
      counts[entry.foodId] = (counts[entry.foodId] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([foodId]) => foodId);
}

export function getRecentFoodIds(days = {}, limit = 8) {
  const entries = Object.values(days)
    .flatMap((dayLog) => dayLog?.entries || [])
    .filter((entry) => entry.foodId && entry.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const seen = new Set();
  const recentIds = [];

  entries.forEach((entry) => {
    if (!seen.has(entry.foodId)) {
      seen.add(entry.foodId);
      recentIds.push(entry.foodId);
    }
  });

  return recentIds.slice(0, limit);
}
