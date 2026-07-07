import MealLogItem from "./MealLogItem";

function MealGroup({ title, entries, onDelete, onEdit, variant = "today" }) {
  if (!entries.length) return null;

  const isPlan = variant === "plan";

  const totalCalories = entries.reduce((sum, entry) => {
    return sum + Number(entry.calories || 0);
  }, 0);

  return (
    <section
      className={`rounded-[1.75rem] border p-4 shadow-sm ${
        isPlan
          ? "border-indigo-100 bg-indigo-50/50"
          : "border-slate-200/80 bg-white"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-950">{title}</h3>

            {isPlan && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-600 ring-1 ring-indigo-100">
                Planned
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            {entries.length} item{entries.length === 1 ? "" : "s"}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-2xl px-3 py-2 text-right ${
            isPlan ? "bg-indigo-100" : "bg-amber-50"
          }`}
        >
          <p
            className={`text-sm font-black leading-none ${
              isPlan ? "text-indigo-700" : "text-amber-700"
            }`}
          >
            {Math.round(totalCalories)}
          </p>
          <p
            className={`mt-0.5 text-[10px] font-black uppercase tracking-wide ${
              isPlan ? "text-indigo-600" : "text-amber-700/70"
            }`}
          >
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
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}

export default MealGroup;