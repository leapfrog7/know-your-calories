import { calculateNutrition } from "../meals/nutrition";

function FoodResultCard({ food, onSelect }) {
  const defaultPortion = food.portions?.[0] || {
    label: "100g",
    type: "grams",
    grams: 100,
  };

  const nutrition = calculateNutrition(food, defaultPortion, 1);

  return (
    <button
      type="button"
      onClick={() => onSelect(food)}
      className="w-full rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-black text-slate-950">
              {food.name}
            </p>

            <SourceBadge food={food} />
          </div>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {food.category} · {defaultPortion.label}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
          {nutrition.calories} kcal
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        P {nutrition.protein}g · C {nutrition.carbs}g · F {nutrition.fat}g
      </p>

      <p className="mt-2 text-[11px] font-semibold text-slate-400">
        {food.source} · {food.foodType} · {food.servingUnitGroup || "serving"} ·
        per 100g: {food.caloriesPer100g} kcal
      </p>
    </button>
  );
}

function SourceBadge({ food }) {
  const isPackaged = food.foodType === "packaged";

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
        isPackaged
          ? "bg-indigo-50 text-indigo-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {isPackaged ? "Packaged" : "Indian"}
    </span>
  );
}

export default FoodResultCard;