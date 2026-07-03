import { useMemo, useState } from "react";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { calculateNutrition } from "../meals/nutrition";
import { getDefaultMealByTime, MEAL_ORDER } from "../meals/mealHelpers";
import PortionSelector from "./PortionSelector";
import QuantityStepper from "./QuantityStepper";

function SelectedFoodPanel({ food, onChangeFood, onAdd }) {
  const [portionIndex, setPortionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [meal, setMeal] = useState(() => getDefaultMealByTime());

  const safePortionIndex = food.portions?.[portionIndex] ? portionIndex : 0;

  const selectedPortion = food.portions?.[safePortionIndex] || {
    label: "100g",
    type: "grams",
    grams: 100,
  };

  const preview = useMemo(() => {
    return calculateNutrition(food, selectedPortion, quantity);
  }, [food, selectedPortion, quantity]);

  function handleAdd() {
    onAdd({
      foodId: food.id,
      foodName: food.name,
      source: food.source,
      barcode: food.barcode || null,
      brand: food.brand || null,
      imageUrl: food.imageUrl || "",
      meal,
      portionLabel: selectedPortion.label,
      portionType: selectedPortion.type,
      servingGrams: selectedPortion.grams || null,
      quantity,
      servingText: preview.servingText,
      productSnapshot: {
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        freeSugarPer100g: food.freeSugarPer100g,
        source: food.source,
        brand: food.brand || null,
        barcode: food.barcode || null,
      },
      ...preview,
    });
  }

  return (
    <div className="space-y-4 pb-28">
     <div className="flex w-full justify-end">
  <button
    type="button"
    onClick={onChangeFood}
    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition active:scale-[0.98] active:bg-slate-50"
    aria-label="Change selected food"
  >
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
      ←
    </span>
    <span>Change 📝</span>
  </button>
</div>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
                Selected food
              </p>

              <h2 className="mt-1 line-clamp-2 text-2xl font-black tracking-tight text-slate-950">
                {food.name}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  Default: {food.defaultServing?.label || selectedPortion.label}
                </span>

                {food.brand && (
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                    {food.brand}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {/* {food.imageUrl ? (
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="h-20 w-20 rounded-3xl border border-slate-100 bg-slate-50 object-contain p-1.5"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-2xl">
                  🍽️
                </div>
              )} */}

              <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-1.5 text-center">
                <p className="text-sm font-black leading-none text-amber-700">
                  {preview.calories}
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700/70">
                  kcal
                </p>
              </div>
            </div>
          </div>

          {food.notes && (
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-slate-500">
              {food.notes}
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">Meal</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Choose where to log this food.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {meal}
            </span>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MEAL_ORDER.map((mealName) => {
              const isSelected = meal === mealName;

              return (
                <button
                  key={mealName}
                  type="button"
                  onClick={() => setMeal(mealName)}
                  className={`shrink-0 rounded-2xl border px-4 py-3 text-sm font-black transition active:scale-[0.98] ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {mealName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 p-5">
          <PortionSelector
            portions={food.portions || []}
            selectedIndex={safePortionIndex}
            onChange={setPortionIndex}
          />

          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>

        <div className="border-t border-slate-100 p-5">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-4 text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Estimated total
                  </p>

                  <p className="mt-2 text-4xl font-black tracking-tight">
                    {preview.calories}
                    <span className="ml-1 text-base font-black text-slate-400">
                      kcal
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                  <p className="text-xs font-bold text-slate-400">Serving</p>
                  <p className="mt-0.5 max-w-[110px] truncate text-xs font-black text-white">
                    {preview.servingText}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 ring-1 ring-emerald-300/15">
                  <p className="text-[10px] font-black uppercase tracking-wide text-emerald-200">
                    Protein
                  </p>
                  <p className="mt-1 text-sm font-black text-emerald-50">
                    {preview.protein}g
                  </p>
                </div>

                <div className="rounded-2xl bg-sky-400/15 px-3 py-2 ring-1 ring-sky-300/15">
                  <p className="text-[10px] font-black uppercase tracking-wide text-sky-200">
                    Carbs
                  </p>
                  <p className="mt-1 text-sm font-black text-sky-50">
                    {preview.carbs}g
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-400/15 px-3 py-2 ring-1 ring-amber-300/15">
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-200">
                    Fat
                  </p>
                  <p className="mt-1 text-sm font-black text-amber-50">
                    {preview.fat}g
                  </p>
                </div>
              </div>

              {preview.freeSugar > 0 && (
                <p className="mt-3 rounded-2xl bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-200 ring-1 ring-rose-300/10">
                  Free sugar {preview.freeSugar}g
                </p>
              )}

              <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
                {preview.grams ? `Approx. ${preview.grams}g total quantity` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto max-w-5xl">
          <PrimaryButton onClick={handleAdd}>
            Add {preview.servingText} · {preview.calories} kcal
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default SelectedFoodPanel;