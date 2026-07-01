function QuickAddStrip({ foods, onSelectFood }) {
  if (!foods.length) return null;

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-black text-slate-950">Quick add</h3>
        <p className="text-xs font-semibold text-slate-400">Common foods</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {foods.map((food) => (
          <button
            key={food.id}
            type="button"
            onClick={() => onSelectFood(food.id)}
            className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left active:scale-[0.98]"
          >
            <p className="whitespace-nowrap text-sm font-black text-slate-900">
              {food.shortName || food.name}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {food.calories} kcal
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickAddStrip;
