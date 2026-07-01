import MealLogItem from "./MealLogItem";

function MealGroup({ title, entries, onDelete }) {
  if (!entries.length) return null;

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        <p className="text-sm font-black text-slate-500">
          {totalCalories} kcal
        </p>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <MealLogItem key={entry.id} entry={entry} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

export default MealGroup;
