function FoodResultCard({ food, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(food)}
      className="w-full rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950">
            {food.name}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {food.category} · {food.defaultServingLabel}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
          {food.calories} kcal
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        Protein {food.protein}g · Carbs {food.carbs}g · Fat {food.fat}g
      </p>
    </button>
  );
}

export default FoodResultCard;
