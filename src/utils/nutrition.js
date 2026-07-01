export function calculateNutrition(food, portionMultiplier = 1, quantity = 1) {
  const factor = portionMultiplier * quantity;

  return {
    calories: Math.round(food.calories * factor),
    protein: Number((food.protein * factor).toFixed(1)),
    carbs: Number((food.carbs * factor).toFixed(1)),
    fat: Number((food.fat * factor).toFixed(1)),
  };
}

export function calculateTotals(entries = []) {
  return entries.reduce(
    (totals, entry) => {
      totals.calories += entry.calories;
      totals.protein += entry.protein;
      totals.carbs += entry.carbs;
      totals.fat += entry.fat;
      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );
}
