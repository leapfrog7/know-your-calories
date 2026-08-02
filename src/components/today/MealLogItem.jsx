import { useState } from "react";

function MealLogItem({ entry, onDelete, onEdit, variant = "today" }) {
  const [showActions, setShowActions] = useState(false);
  const isPlan = variant === "plan";
  const servingText = entry.servingText || `${entry.quantity} × ${entry.servingGrams || "-"}g${entry.portionLabel ? ` · ${entry.portionLabel}` : ""}`;

  return (
    <div className="flex w-full items-center gap-3 py-4">
      <button type="button" onClick={() => onEdit(entry)} className="min-w-0 flex-1 text-left active:opacity-70">
        <p className="truncate text-[15px] font-black text-slate-950">{entry.foodName}</p>
        <p className="mt-1.5 truncate text-xs font-medium leading-relaxed text-slate-500">
          {servingText}{!isPlan ? ` · P ${entry.protein}g · C ${entry.carbs}g · F ${entry.fat}g` : ""}
        </p>
      </button>
      <p className={`shrink-0 text-sm font-black ${isPlan ? "text-indigo-700" : "text-emerald-700"}`}>{entry.calories} <span className="text-[10px] font-bold text-slate-400">kcal</span></p>
      <div className="relative shrink-0">
        <button type="button" onClick={() => setShowActions((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black text-slate-400 active:bg-slate-100" aria-label={`Actions for ${entry.foodName}`} aria-expanded={showActions}>⋮</button>
        {showActions && (
          <div className="absolute right-0 top-11 z-20 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <button type="button" onClick={() => { setShowActions(false); onEdit(entry); }} className="min-h-11 w-full px-4 text-left text-sm font-bold text-slate-700 active:bg-slate-50">Edit</button>
            <button type="button" onClick={() => { setShowActions(false); onDelete(entry.id); }} className="min-h-11 w-full px-4 text-left text-sm font-bold text-rose-600 active:bg-rose-50">Remove</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MealLogItem;
