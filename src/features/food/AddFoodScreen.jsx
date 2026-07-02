import { useMemo, useState } from "react";
import { getAllFoods, getFoodById } from "../../data/foods";
import CustomFoodForm from "./CustomFoodForm";
import { addEntryToDate, getAllDays } from "../meals/mealStorage";
import { getFrequentFoodIds, getRecentFoodIds } from "../meals/mealHelpers";
import FoodSearchInput from "./FoodSearchInput";
import FoodResultCard from "./FoodResultCard";
import SelectedFoodPanel from "./SelectedFoodPanel";
import BarcodeLookup from "./BarcodeLookup";

const FILTERS = [
  {
    id: "all",
    label: "All",
    helper: "Indian + packaged",
  },
  {
    id: "indian",
    label: "Indian foods",
    helper: "Meals & recipes",
  },
  {
    id: "packaged",
    label: "Packaged",
    helper: "Snacks & labels",
  },
];

const POPULAR_INDIAN_KEYWORDS = [
  "roti",
  "chapati",
  "rice",
  "dal",
  "rajma",
  "chole",
  "paratha",
  "curd",
  "tea",
  "poha",
  "idli",
  "samosa",
];

const POPULAR_PACKAGED_KEYWORDS = [
  "biscuit",
  "chips",
  "bread",
  "noodles",
  "cola",
];

function AddFoodScreen({ initialFoodId = null, onBack, onFoodAdded }) {
  const initialFood = initialFoodId ? getFoodById(initialFoodId) : null;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedFood, setSelectedFood] = useState(initialFood || null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customRefreshKey, setCustomRefreshKey] = useState(0);

  const allFoods = useMemo(() => getAllFoods(), [customRefreshKey]);

  const days = getAllDays();
  const query = search.trim().toLowerCase();

  const canSearch =
    activeFilter === "packaged" ? query.length >= 3 : query.length >= 2;

  const sourceFilteredFoods = useMemo(() => {
    if (activeFilter === "indian") {
      return allFoods.filter((food) => food.source === "INDB");
    }

    if (activeFilter === "packaged") {
      return allFoods.filter((food) => food.foodType === "packaged");
    }

    return allFoods;
  }, [activeFilter, allFoods]);

  const recentFoods = useMemo(() => {
    const recentIds = getRecentFoodIds(days, 8);

    return recentIds
      .map(getFoodById)
      .filter(Boolean)
      .filter((food) => matchesActiveFilter(food, activeFilter));
  }, [days, activeFilter, customRefreshKey]);

  const frequentFoods = useMemo(() => {
    const frequentIds = getFrequentFoodIds(days, 8);

    return frequentIds
      .map(getFoodById)
      .filter(Boolean)
      .filter((food) => matchesActiveFilter(food, activeFilter));
  }, [days, activeFilter, customRefreshKey]);

  const popularIndianFoods = useMemo(() => {
    return getPopularFoodsByKeywords(allFoods, POPULAR_INDIAN_KEYWORDS)
      .filter((food) => food.source === "INDB")
      .slice(0, 10);
  }, [allFoods]);

  const popularPackagedFoods = useMemo(() => {
    return getPopularFoodsByKeywords(allFoods, POPULAR_PACKAGED_KEYWORDS)
      .filter((food) => food.foodType === "packaged")
      .slice(0, 8);
  }, [allFoods]);

  const filteredFoods = useMemo(() => {
    if (!canSearch) {
      return [];
    }

    return sourceFilteredFoods
      .filter((food) => {
        const nameMatch = food.name?.toLowerCase().includes(query);
        const shortNameMatch = food.shortName?.toLowerCase().includes(query);
        const categoryMatch = food.category?.toLowerCase().includes(query);
        const sourceMatch = food.source?.toLowerCase().includes(query);
        const cuisineMatch = food.cuisine?.toLowerCase().includes(query);
        const foodTypeMatch = food.foodType?.toLowerCase().includes(query);
        const brandMatch = food.brand?.toLowerCase().includes(query);
        const barcodeMatch = food.barcode?.toLowerCase().includes(query);
        const aliasMatch = food.aliases?.some((alias) =>
          alias.toLowerCase().includes(query),
        );

        return (
          nameMatch ||
          shortNameMatch ||
          categoryMatch ||
          sourceMatch ||
          cuisineMatch ||
          foodTypeMatch ||
          brandMatch ||
          barcodeMatch ||
          aliasMatch
        );
      })
      .slice(0, 40);
  }, [canSearch, query, sourceFilteredFoods]);

  function handleAdd(entry) {
    addEntryToDate(entry);
    onFoodAdded();
  }

  function handleFilterChange(filterId) {
    setActiveFilter(filterId);
    setSelectedFood(null);
  }

  function handleCustomFoodSaved(food) {
    setCustomRefreshKey((key) => key + 1);
    setShowCustomForm(false);
    setSelectedFood(food);
  }

  if (showCustomForm) {
    return (
      <CustomFoodForm
        onCancel={() => setShowCustomForm(false)}
        onSaved={handleCustomFoodSaved}
      />
    );
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
            Search food, scan barcode, or add custom food
          </p>
        </div>
      </div>

      <FoodSearchInput value={search} onChange={setSearch} />

      <FilterTabs activeFilter={activeFilter} onChange={handleFilterChange} />

      <button
        type="button"
        onClick={() => setShowCustomForm(true)}
        className="w-full rounded-[1.5rem] border border-dashed border-emerald-300 bg-emerald-50 px-4 py-4 text-left transition active:scale-[0.99]"
      >
        <p className="text-base font-black text-emerald-900">
          + Add custom food
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-700">
          Enter calories and macros manually for anything missing.
        </p>
      </button>

      {!canSearch && (
        <div className="space-y-4">
          {activeFilter === "packaged" && (
            <BarcodeLookup onProductFound={setSelectedFood} />
          )}

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

          {(activeFilter === "all" || activeFilter === "indian") && (
            <FoodSection
              title="Popular Indian foods"
              foods={popularIndianFoods}
              onSelect={setSelectedFood}
            />
          )}

          {(activeFilter === "all" || activeFilter === "packaged") && (
            <FoodSection
              title="Common packaged foods"
              foods={popularPackagedFoods}
              onSelect={setSelectedFood}
            />
          )}

          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-5 text-center">
            <p className="font-black text-slate-800">
              Search the full database
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {activeFilter === "packaged"
                ? "Type at least 3 letters to search local packaged foods, or use barcode lookup."
                : "Type at least 2 letters to search INDB foods."}
            </p>
          </div>
        </div>
      )}

      {canSearch && (
        <div className="space-y-4">
          {activeFilter === "packaged" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Local packaged results
                </p>

                <p className="text-xs font-bold text-slate-400">
                  {filteredFoods.length}
                  {filteredFoods.length === 40 ? "+" : ""} found
                </p>
              </div>

              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <FoodResultCard
                    key={food.id}
                    food={food}
                    onSelect={setSelectedFood}
                  />
                ))
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-5 text-center">
                  <p className="font-black text-slate-800">
                    No local packaged food found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Use barcode lookup from the Packaged screen, or add it as a
                    custom food.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Search results
                </p>

                <p className="text-xs font-bold text-slate-400">
                  {filteredFoods.length}
                  {filteredFoods.length === 40 ? "+" : ""} found
                </p>
              </div>

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
                    Try another spelling, switch filter, or add it as a custom
                    food.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterTabs({ activeFilter, onChange }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-2 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              className={`rounded-2xl px-3 py-3 text-left transition active:scale-[0.99] ${
                active
                  ? "bg-slate-950 text-white"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              <p className="text-sm font-black">{filter.label}</p>
              <p
                className={`mt-0.5 hidden text-[11px] font-semibold sm:block ${
                  active ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {filter.helper}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FoodSection({ title, foods, onSelect }) {
  if (!foods.length) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
          {title}
        </h3>

        <p className="text-xs font-bold text-slate-400">
          {foods.length} item{foods.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3">
        {foods.map((food) => (
          <FoodResultCard key={food.id} food={food} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function matchesActiveFilter(food, activeFilter) {
  if (activeFilter === "indian") {
    return food.source === "INDB";
  }

  if (activeFilter === "packaged") {
    return food.foodType === "packaged";
  }

  return true;
}

function getPopularFoodsByKeywords(allFoods, keywords) {
  const selected = [];
  const usedIds = new Set();

  keywords.forEach((keyword) => {
    const match = allFoods.find((food) => {
      const name = food.name?.toLowerCase() || "";
      const aliases = food.aliases || [];

      return (
        name.includes(keyword) ||
        aliases.some((alias) => alias.toLowerCase().includes(keyword))
      );
    });

    if (match && !usedIds.has(match.id)) {
      usedIds.add(match.id);
      selected.push(match);
    }
  });

  return selected;
}

export default AddFoodScreen;
