import MealLogItem from "./MealLogItem";

function MealGroup({ title, entries, onDelete, onEdit }) {
  if (!entries.length) return null;

  const totalCalories = entries.reduce((sum, entry) => {
    return sum + Number(entry.calories || 0);
  }, 0);

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">{title}</h3>

          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            {entries.length} item{entries.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-amber-50 px-3 py-2 text-right">
          <p className="text-sm font-black leading-none text-amber-700">
            {Math.round(totalCalories)}
          </p>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700/70">
            kcal
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <MealLogItem
            key={entry.id}
            entry={entry}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  );
}

export default MealGroup;
