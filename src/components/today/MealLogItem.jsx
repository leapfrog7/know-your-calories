function MealLogItem({ entry, onDelete, onEdit, variant = "today" }) {
  const isPlan = variant === "plan";

  const servingText =
    entry.servingText ||
    `${entry.quantity} × ${entry.servingGrams || "-"}g${
      entry.portionLabel ? ` · ${entry.portionLabel}` : ""
    }`;

  return (
    <div
      className={`flex w-full items-start justify-between gap-3 border transition active:scale-[0.99] ${
        isPlan
          ? "rounded-2xl border-slate-100 bg-slate-50 px-3 py-3"
          : "rounded-3xl border-slate-100 bg-white px-4 py-3.5 shadow-sm"
      }`}
    >
      <div className="min-w-0 flex-1 pr-1">
        <p className="truncate text-sm font-black tracking-tight text-slate-950">
          {entry.foodName}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
          {servingText}
        </p>

        {!isPlan && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700"
          >
            P {entry.protein}g
          </span>

          <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-black text-sky-700">
            C {entry.carbs}g
          </span>

          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700">
            F {entry.fat}g
          </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div
          className={`rounded-2xl px-3 py-2 text-center ${
            isPlan
              ? "min-w-[58px] bg-indigo-50"
              : "min-w-[64px] bg-green-100 shadow-sm"
          }`}
        >
          <p
            className={`text-sm font-black leading-none ${
              isPlan ? "text-indigo-800" : "text-green-800"
            }`}
          >
            {entry.calories}
          </p>

          <p
            className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide ${
              isPlan ? "text-indigo-700" : "text-green-800"
            }`}
          >
            kcal
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
              isPlan
                ? "bg-indigo-50 text-indigo-600 active:bg-indigo-100"
                : "bg-slate-100 text-slate-500 active:bg-slate-200 active:text-slate-700"
            }`}
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
