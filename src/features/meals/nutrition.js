export function calculateNutrition(food, portionMultiplier = 1, quantity = 1) {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const factor = portionMultiplier * safeQuantity;

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
      totals.calories += Number(entry.calories) || 0;
      totals.protein += Number(entry.protein) || 0;
      totals.carbs += Number(entry.carbs) || 0;
      totals.fat += Number(entry.fat) || 0;
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

export function roundTotals(totals) {
  return {
    calories: Math.round(totals.calories),
    protein: Number(totals.protein.toFixed(1)),
    carbs: Number(totals.carbs.toFixed(1)),
    fat: Number(totals.fat.toFixed(1)),
  };
}
