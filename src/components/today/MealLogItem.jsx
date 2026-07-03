function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6.5 6l1 14h9l1-14" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function MealLogItem({ entry, onDelete }) {
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

        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="flex h-9 w-9 items-center justify-center rounded-md px-1 bg-slate-200 text-rose-400 transition active:bg-red-50 active:text-red-600"
          aria-label={`Remove ${entry.foodName}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default MealLogItem;