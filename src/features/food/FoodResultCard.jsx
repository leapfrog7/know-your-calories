function FoodResultCard({ food, onSelect, onQuickAdd }) {
  const foodName = getTextValue(food.name) || "Food item";
  const category = getTextValue(food.category);
  const servingText = getServingText(food);
  const calories = getCaloriesText(food);
  const protein = getMacroValue(food.protein ?? food.proteinPer100g);
  const carbs = getMacroValue(food.carbs ?? food.carbsPer100g);
  const fat = getMacroValue(food.fat ?? food.fatPer100g);
  const source = getTextValue(food.source) || "Food database";

  function handleCardKeyDown(event) {
    if (event.key === "Enter") {
      onSelect(food);
    }
  }

  function handleQuickAdd(event) {
    event.stopPropagation();

    if (typeof onQuickAdd === "function") {
      onQuickAdd(food);
      return;
    }

    onSelect(food);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(food)}
      onKeyDown={handleCardKeyDown}
      className="w-full cursor-pointer rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black tracking-tight text-slate-950">
              {foodName}
            </h3>

            {category && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                {category}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            {servingText}
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            P {protein}g · C {carbs}g · F {fat}g
          </p>

          <p className="mt-2 text-xs font-medium text-slate-400">
            {source}
            {food.caloriesPer100g
              ? ` · per 100g: ${Math.round(food.caloriesPer100g)} kcal`
              : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
            {calories}
          </span>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-xl font-black leading-none text-white shadow-sm transition active:scale-[0.95]"
            aria-label={`Quick add ${foodName}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function getTextValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return value.label || value.name || value.type || "";
  }

  return "";
}

function getServingText(food) {
  const servingLabel = getTextValue(food.servingLabel);
  const defaultServing = getTextValue(food.defaultServing);

  if (servingLabel) {
    return servingLabel;
  }

  if (defaultServing) {
    return defaultServing;
  }

  if (food.defaultServingGram) {
    return `${food.defaultServingGram}g default serving`;
  }

  if (food.defaultGrams) {
    return `${food.defaultGrams}g default serving`;
  }

  if (food.caloriesPer100g) {
    return "Per 100g";
  }

  return "Per serving";
}

function getCaloriesText(food) {
  const calories =
    food.calories ??
    food.kcal ??
    food.energyKcal ??
    food.caloriesPerServing ??
    food.caloriesPer100g;

  if (typeof calories === "number") {
    return `${Math.round(calories)} kcal`;
  }

  const textCalories = getTextValue(calories);

  if (textCalories) {
    return `${textCalories} kcal`;
  }

  return "— kcal";
}

function getMacroValue(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : Number(value.toFixed(1));
  }

  const parsed = Number(value);

  if (Number.isFinite(parsed)) {
    return Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(1));
  }

  return 0;
}

export default FoodResultCard;