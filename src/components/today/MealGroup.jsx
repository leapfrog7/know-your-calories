import MealLogItem from "./MealLogItem";

function MealGroup({ title, entries, onDelete, onEdit, onAdd, variant = "today" }) {
  const isPlan = variant === "plan";
  if (!entries.length && !isPlan) return null;

  const totalCalories = entries.reduce((sum, entry) => sum + Number(entry.calories || 0), 0);

  return (
    <section className={isPlan ? "border-b border-indigo-100 px-4 last:border-0" : "border-b border-slate-200 last:border-0"}>
      <div className="flex min-h-16 items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-950">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            {entries.length ? `${entries.length} item${entries.length === 1 ? "" : "s"}` : "Nothing planned"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && <p className={`text-sm font-black ${isPlan ? "text-indigo-700" : "text-slate-700"}`}>{Math.round(totalCalories)} <span className="text-[10px] text-slate-400">kcal</span></p>}
          {isPlan && (
            <button type="button" onClick={onAdd} className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl font-black text-indigo-700 active:bg-indigo-100" aria-label={`Add food to ${title}`}>+</button>
          )}
        </div>
      </div>
      {entries.length > 0 && (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {entries.map((entry) => <MealLogItem key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} variant={variant} />)}
        </div>
      )}
    </section>
  );
}

export default MealGroup;
