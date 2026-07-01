import { useMemo, useState } from "react";
import { foods } from "../../data/foods";
import { addEntryToDate } from "../meals/mealStorage";
import { getAllDays } from "../meals/mealStorage";
import { getFrequentFoodIds, getRecentFoodIds } from "../meals/mealHelpers";
import FoodSearchInput from "./FoodSearchInput";
import FoodResultCard from "./FoodResultCard";
import SelectedFoodPanel from "./SelectedFoodPanel";

function AddFoodScreen({ initialFoodId = null, onBack, onFoodAdded }) {
  const initialFood = initialFoodId
    ? foods.find((food) => food.id === initialFoodId)
    : null;

  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState(initialFood || null);

  const days = getAllDays();

  const recentFoods = useMemo(() => {
    const recentIds = getRecentFoodIds(days, 8);
    return recentIds
      .map((foodId) => foods.find((food) => food.id === foodId))
      .filter(Boolean);
  }, [days]);

  const frequentFoods = useMemo(() => {
    const frequentIds = getFrequentFoodIds(days, 8);
    return frequentIds
      .map((foodId) => foods.find((food) => food.id === foodId))
      .filter(Boolean);
  }, [days]);

  const commonFoods = foods.slice(0, 8);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return foods;
    }

    return foods.filter((food) => {
      const nameMatch = food.name.toLowerCase().includes(query);
      const categoryMatch = food.category.toLowerCase().includes(query);
      const aliasMatch = food.aliases?.some((alias) =>
        alias.toLowerCase().includes(query),
      );

      return nameMatch || categoryMatch || aliasMatch;
    });
  }, [search]);

  function handleAdd(entry) {
    addEntryToDate(entry);
    onFoodAdded();
  }

  if (selectedFood) {
    return (
      <SelectedFoodPanel
        food={selectedFood}
        onChangeFood={() => setSelectedFood(null)}
        onAdd={handleAdd}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm active:scale-[0.98]"
        >
          Back
        </button>

        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Add Food
          </h2>
          <p className="text-sm text-slate-500">
            Search or choose a common item
          </p>
        </div>
      </div>

      <FoodSearchInput value={search} onChange={setSearch} />

      {!search.trim() && (
        <div className="space-y-4">
          {recentFoods.length > 0 && (
            <FoodSection
              title="Recent"
              foods={recentFoods}
              onSelect={setSelectedFood}
            />
          )}

          {frequentFoods.length > 0 && (
            <FoodSection
              title="Frequent"
              foods={frequentFoods}
              onSelect={setSelectedFood}
            />
          )}

          <FoodSection
            title="Common foods"
            foods={commonFoods}
            onSelect={setSelectedFood}
          />
        </div>
      )}

      {search.trim() && (
        <div className="space-y-3">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <FoodResultCard
                key={food.id}
                food={food}
                onSelect={setSelectedFood}
              />
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="font-black text-slate-800">No food found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another spelling or add it to the food database later.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FoodSection({ title, foods, onSelect }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
        {title}
      </h3>

      <div className="space-y-3">
        {foods.map((food) => (
          <FoodResultCard key={food.id} food={food} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

export default AddFoodScreen;
