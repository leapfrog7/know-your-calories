const DEFAULT_MEAL_TIMES = {
  Breakfast: "06:00",
  Lunch: "12:00",
  "Evening Snack": "16:00",
  Dinner: "20:00",
};

export function getMealPlanTiming(meal, settings, now = new Date()) {
  if (settings?.mealPlanMode === "manual" || meal === "Other") {
    return {
      isDue: true,
      label: "Ready when you are",
    };
  }

  const time = settings?.mealTimes?.[meal] || DEFAULT_MEAL_TIMES[meal];

  if (!time) {
    return { isDue: true, label: "Ready when you are" };
  }

  const [hours, minutes] = time.split(":").map(Number);
  const dueMinutes = hours * 60 + minutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return {
    isDue: currentMinutes >= dueMinutes,
    label: `${currentMinutes >= dueMinutes ? "Due since" : "Due at"} ${formatTime(time)}`,
  };
}

export function formatMealTime(time) {
  return formatTime(time);
}

function formatTime(time) {
  const [hours, minutes] = String(time || "").split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}
