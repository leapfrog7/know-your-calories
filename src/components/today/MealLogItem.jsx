function MealLogItem({ entry, onDelete, onEdit }) {
  const servingText =
    entry.servingText ||
    `${entry.quantity} × ${entry.servingGrams || "-"}g${
      entry.portionLabel ? ` · ${entry.portionLabel}` : ""
    }`;

  return (
    <div className="flex w-full items-start justify-between gap-3 rounded-3xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition active:scale-[0.99]">
      <div className="min-w-0 flex-1 pr-1">
        <p className="truncate text-sm font-black tracking-tight text-slate-950">
          {entry.foodName}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
          {servingText}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
            P {entry.protein}g
          </span>

          <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-black text-sky-700">
            C {entry.carbs}g
          </span>

          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700">
            F {entry.fat}g
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="min-w-[64px] rounded-2xl bg-green-100 px-3 py-2 text-center shadow-sm">
          <p className="text-sm font-black leading-none text-green-800">
            {entry.calories}
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">
            kcal
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500 transition active:bg-slate-200 active:text-slate-700"
            aria-label={`Edit ${entry.foodName}`}
          >
            ✎
          </button>

          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-sm text-rose-500 transition active:bg-rose-100 active:text-rose-700"
            aria-label={`Remove ${entry.foodName}`}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealLogItem;
