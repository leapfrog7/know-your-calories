import { useMemo, useState } from "react";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { calculateNutrition } from "../meals/nutrition";
import { getDefaultMealByTime, MEAL_ORDER } from "../meals/mealHelpers";
import PortionSelector from "./PortionSelector";
import QuantityStepper from "./QuantityStepper";

function SelectedFoodPanel({ food, onChangeFood, onAdd }) {
  const [portionIndex, setPortionIndex] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [meal, setMeal] = useState(() => getDefaultMealByTime());

  const safePortionIndex = food.portions[portionIndex] ? portionIndex : 0;
  const selectedPortion = food.portions[safePortionIndex];

  const preview = useMemo(() => {
    return calculateNutrition(food, selectedPortion.multiplier, quantity);
  }, [food, selectedPortion, quantity]);

  function handleAdd() {
    onAdd({
      foodId: food.id,
      foodName: food.name,
      meal,
      portionLabel: selectedPortion.label,
      quantity,
      ...preview,
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onChangeFood}
        className="text-sm font-black text-emerald-700"
      >
        ← Change food
      </button>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black tracking-tight text-slate-950">
              {food.name}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {food.defaultServingLabel}
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
            {food.calories} kcal
          </div>
        </div>

        {food.notes && (
          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            {food.notes}
          </p>
        )}

        <div className="mt-5">
          <p className="text-sm font-black text-slate-950">Meal</p>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MEAL_ORDER.map((mealName) => (
              <button
                key={mealName}
                type="button"
                onClick={() => setMeal(mealName)}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-black active:scale-[0.99] ${
                  meal === mealName
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {mealName}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <PortionSelector
            portions={food.portions}
            selectedIndex={safePortionIndex}
            onChange={setPortionIndex}
          />
        </div>

        <div className="mt-5">
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>

        <div className="mt-5 rounded-[1.5rem] bg-slate-950 p-4 text-white">
          <p className="text-sm font-semibold text-slate-400">
            Estimated total
          </p>

          <p className="mt-1 text-3xl font-black">
            {preview.calories}
            <span className="ml-1 text-base font-bold text-slate-400">
              kcal
            </span>
          </p>

          <p className="mt-2 text-sm font-medium text-slate-300">
            Protein {preview.protein}g · Carbs {preview.carbs}g · Fat{" "}
            {preview.fat}g
          </p>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto max-w-5xl">
          <PrimaryButton onClick={handleAdd}>
            Add {quantity} × {selectedPortion.label} · {preview.calories} kcal
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default SelectedFoodPanel;
