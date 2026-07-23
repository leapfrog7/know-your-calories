import MealLogItem from "./MealLogItem";

function MealGroup({
  title,
  entries,
  onDelete,
  onEdit,
  onAdd,
  variant = "today",
}) {
  const isPlan = variant === "plan";
  if (!entries.length && !isPlan) return null;

  const totalCalories = entries.reduce((sum, entry) => {
    return sum + Number(entry.calories || 0);
  }, 0);

  return (
    <section
      className={`border shadow-sm ${
        isPlan
          ? "rounded-2xl border-indigo-100 bg-white p-3"
          : "rounded-[1.75rem] border-slate-200/80 bg-white p-4"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 ${
          entries.length ? "mb-3" : ""
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-950">{title}</h3>
          </div>

          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            {entries.length
              ? `${entries.length} item${entries.length === 1 ? "" : "s"}`
              : "Nothing planned"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {entries.length > 0 && (
            <div
              className={`rounded-2xl px-3 py-2 text-right ${
                isPlan ? "bg-indigo-50" : "bg-amber-50"
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
                  isPlan ? "text-indigo-500" : "text-amber-700/70"
                }`}
              >
                kcal
              </p>
            </div>
          )}

          {isPlan && (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white outline-none transition active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-indigo-100"
              aria-label={`Add food to ${title}`}
            >
              +
            </button>
          )}
        </div>
      </div>

      {entries.length > 0 && (
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
      )}
    </section>
  );
}

export default MealGroup;
