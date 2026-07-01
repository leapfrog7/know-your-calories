function MealLogItem({ entry, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-slate-950">
          {entry.foodName}
        </p>

        <p className="mt-0.5 text-xs font-semibold text-slate-500">
          {entry.quantity} × {entry.portionLabel}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-black text-slate-950">
          {entry.calories} kcal
        </p>

        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="mt-1 rounded-full px-2 py-1 text-xs font-bold text-slate-400 active:bg-red-50 active:text-red-600"
          aria-label={`Remove ${entry.foodName}`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default MealLogItem;
