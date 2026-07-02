export function calculateNutrition(food, portion, quantity = 1) {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  if (portion?.type === "unit" && portion.nutrition) {
    return {
      calories: Math.round(
        (Number(portion.nutrition.calories) || 0) * safeQuantity
      ),
      protein: Number(
        ((Number(portion.nutrition.protein) || 0) * safeQuantity).toFixed(1)
      ),
      carbs: Number(
        ((Number(portion.nutrition.carbs) || 0) * safeQuantity).toFixed(1)
      ),
      fat: Number(
        ((Number(portion.nutrition.fat) || 0) * safeQuantity).toFixed(1)
      ),
      freeSugar: Number(
        ((Number(portion.nutrition.freeSugar) || 0) * safeQuantity).toFixed(1)
      ),
      grams: portion.grams ? Math.round(portion.grams * safeQuantity) : 0,
      servingText: `${safeQuantity} × ${portion.label}`,
    };
  }

  const safeGrams =
    Number.isFinite(portion?.grams) && portion.grams > 0 ? portion.grams : 100;

  const factor = (safeGrams / 100) * safeQuantity;

  return {
    calories: Math.round((Number(food.caloriesPer100g) || 0) * factor),
    protein: Number(
      ((Number(food.proteinPer100g) || 0) * factor).toFixed(1)
    ),
    carbs: Number(((Number(food.carbsPer100g) || 0) * factor).toFixed(1)),
    fat: Number(((Number(food.fatPer100g) || 0) * factor).toFixed(1)),
    freeSugar: Number(
      ((Number(food.freeSugarPer100g) || 0) * factor).toFixed(1)
    ),
    grams: Math.round(safeGrams * safeQuantity),
 servingText: `${safeQuantity} × ${portion?.label || `${safeGrams}g`}`,
  };
}

export function calculateTotals(entries = []) {
  return entries.reduce(
    (totals, entry) => {
      totals.calories += Number(entry.calories) || 0;
      totals.protein += Number(entry.protein) || 0;
      totals.carbs += Number(entry.carbs) || 0;
      totals.fat += Number(entry.fat) || 0;
      totals.freeSugar += Number(entry.freeSugar) || 0;
      totals.grams += Number(entry.grams) || 0;
      return totals;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      freeSugar: 0,
      grams: 0,
    }
  );
}

export function roundTotals(totals) {
  return {
    calories: Math.round(totals.calories),
    protein: Number(totals.protein.toFixed(1)),
    carbs: Number(totals.carbs.toFixed(1)),
    fat: Number(totals.fat.toFixed(1)),
    freeSugar: Number((totals.freeSugar || 0).toFixed(1)),
    grams: Math.round(totals.grams || 0),
  };
}