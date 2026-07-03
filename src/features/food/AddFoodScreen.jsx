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
  const days = useMemo(() => getAllDays(), [customRefreshKey]);

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
        const searchableValues = [
          food.name,
          food.shortName,
          food.category,
          food.source,
          food.cuisine,
          food.foodType,
          food.brand,
          food.barcode,
          ...(Array.isArray(food.aliases) ? food.aliases : []),
        ];

        return searchableValues.some((value) =>
          getTextValue(value).toLowerCase().includes(query),
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

  function handleQuickAddFood(food) {
    // Safe behaviour for now:
    // '+' opens the existing quantity panel instead of directly adding.
    // Direct add should be implemented only after every food has a reliable default quantity.
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
      {/* Back row */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm transition active:scale-[0.98]"
        >
          <span className="text-base leading-none">←</span>
          <span>Back</span>
        </button>
      </div>

      {/* Main search area */}
      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="mb-3 px-3 py-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Search for food items
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Search meals, recipes, packaged items, or use a saved food.
          </p>
        </div>

        <FoodSearchInput value={search} onChange={setSearch} />

        <div className="mt-3">
          <FilterTabs
            activeFilter={activeFilter}
            onChange={handleFilterChange}
          />
        </div>
      </section>

      {/* Search results */}
      {canSearch && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {activeFilter === "packaged"
                  ? "Packaged results"
                  : "Search results"}
              </p>

              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Tap an item to adjust quantity, or use + to continue quickly.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm ring-1 ring-slate-200">
              {filteredFoods.length}
              {filteredFoods.length === 40 ? "+" : ""} found
            </span>
          </div>

          {filteredFoods.length > 0 ? (
            <div className="space-y-3">
              {filteredFoods.map((food) => (
                <FoodResultCard
                  key={food.id}
                  food={food}
                  onSelect={setSelectedFood}
                  onQuickAdd={handleQuickAddFood}
                />
              ))}
            </div>
          ) : (
            <EmptySearchState
              activeFilter={activeFilter}
              onAddCustom={() => setShowCustomForm(true)}
            />
          )}
        </section>
      )}

      {/* Suggested/default state */}
      {!canSearch && (
        <section className="space-y-4">
          {activeFilter === "packaged" && (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Packaged food
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Search by name or use barcode lookup for branded products.
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-lg">
                  📦
                </span>
              </div>

              <BarcodeLookup onProductFound={setSelectedFood} />
            </div>
          )}

          {recentFoods.length > 0 && (
            <FoodSection
              title="Recent"
              foods={recentFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
            />
          )}

          {frequentFoods.length > 0 && (
            <FoodSection
              title="Frequent"
              foods={frequentFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
            />
          )}

          {(activeFilter === "all" || activeFilter === "indian") && (
            <FoodSection
              title="Popular Indian foods"
              foods={popularIndianFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
            />
          )}

          {(activeFilter === "all" || activeFilter === "packaged") && (
            <FoodSection
              title="Common packaged foods"
              foods={popularPackagedFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
            />
          )}

          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="flex w-full items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition active:scale-[0.99]"
          >
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">
                Can’t find your food?
              </p>

              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                Add calories and macros manually
              </p>
            </div>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-black text-emerald-700">
              +
            </span>
          </button>
        </section>
      )}
    </div>
  );
}

function FilterTabs({ activeFilter, onChange }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-1.5">
      <div className="grid grid-cols-3 gap-1.5">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              className={`rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.99] ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-transparent text-slate-600"
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
    </div>
  );
}

function FoodSection({ title, foods, onSelect, onQuickAdd }) {
  if (!foods.length) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
          {title}
        </h3>

        <p className="text-xs font-bold text-slate-400">
          {foods.length} item{foods.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3">
        {foods.map((food) => (
          <FoodResultCard
            key={food.id}
            food={food}
            onSelect={onSelect}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </section>
  );
}

function EmptySearchState({ activeFilter, onAddCustom }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-lg">
        🔍
      </div>

      <p className="font-black text-slate-800">
        {activeFilter === "packaged" ? "No packaged food found" : "No food found"}
      </p>

      <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-slate-500">
        Try another spelling, switch the filter, or add it manually.
      </p>

      <button
        type="button"
        onClick={onAddCustom}
        className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-sm active:scale-[0.98]"
      >
        Add custom food
      </button>
    </div>
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
      const name = getTextValue(food.name).toLowerCase();
      const aliases = Array.isArray(food.aliases) ? food.aliases : [];

      return (
        name.includes(keyword) ||
        aliases.some((alias) =>
          getTextValue(alias).toLowerCase().includes(keyword),
        )
      );
    });

    if (match && !usedIds.has(match.id)) {
      usedIds.add(match.id);
      selected.push(match);
    }
  });

  return selected;
}

function getTextValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return value.label || value.name || value.type || "";
  }

  return "";
}

export default AddFoodScreen;