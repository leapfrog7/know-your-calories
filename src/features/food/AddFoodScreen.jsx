import { useMemo, useState } from "react";
import { getAllFoods, getFoodById } from "../../data/foods";
import { isCustomFood } from "../../data/customFoodUtils";
import CustomFoodForm from "./CustomFoodForm";
import {
  addEntryToDate,
  getAllDays,
  updateEntryInDate,
} from "../meals/mealStorage";
import { getFrequentFoodIds, getRecentFoodIds } from "../meals/mealHelpers";
import FoodSearchInput from "./FoodSearchInput";
import FoodResultCard from "./FoodResultCard";
import SelectedFoodPanel from "./SelectedFoodPanel";
import BarcodeLookup from "./BarcodeLookup";

const FILTERS = [
  {
    id: "all",
    label: "All",
    helper: "All foods",
  },
  {
    id: "indian",
    label: "Indian",
    helper: "INDB",
  },
  {
    id: "packaged",
    label: "Packaged",
    helper: "Labels",
  },
  {
    id: "custom",
    label: "Custom",
    helper: "Saved",
  },
];

const CUSTOM_SORT_OPTIONS = [
  {
    id: "newest",
    label: "Newest first",
  },
  {
    id: "az",
    label: "A-Z",
  },
  {
    id: "caloriesHigh",
    label: "Calories high to low",
  },
  {
    id: "caloriesLow",
    label: "Calories low to high",
  },
  {
    id: "proteinHigh",
    label: "Protein high to low",
  },
  {
    id: "carbsHigh",
    label: "Carbs high to low",
  },
  {
    id: "fatHigh",
    label: "Fat high to low",
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

function AddFoodScreen({
  initialFoodId = null,
  editingEntry = null,
  targetDateKey = null,
  mode = "today",
  initialMeal = null,
  onBack,
  onFoodAdded,
}) {
  const initialFood = initialFoodId ? getFoodById(initialFoodId) : null;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedFood, setSelectedFood] = useState(initialFood || null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingCustomFood, setEditingCustomFood] = useState(null);
  const [customRefreshKey, setCustomRefreshKey] = useState(0);
  const [customSort, setCustomSort] = useState("newest");

  const isEditing = Boolean(editingEntry);

  const allFoods = useMemo(() => getAllFoods(), [customRefreshKey]);
  const days = useMemo(() => getAllDays(), [customRefreshKey]);

  const customFoods = useMemo(() => {
    return allFoods.filter(isCustomFood);
  }, [allFoods]);

  const gramCustomFoods = useMemo(() => {
    return customFoods.filter(isPer100gCustomFood);
  }, [customFoods]);

  const servingCustomFoods = useMemo(() => {
    return customFoods.filter((food) => !isPer100gCustomFood(food));
  }, [customFoods]);

  const sortedGramCustomFoods = useMemo(() => {
    return sortCustomFoods(gramCustomFoods, customSort);
  }, [gramCustomFoods, customSort]);

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

    if (activeFilter === "custom") {
      return allFoods.filter(isCustomFood);
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

  function handleAddOrUpdate(entry) {
    const dateKey = editingEntry?.date || targetDateKey || undefined;
    const entryWithStatus = {
      ...entry,
      status: mode === "plan" ? "planned" : "consumed",
    };

    if (editingEntry) {
      updateEntryInDate(editingEntry.id, entryWithStatus, dateKey);
    } else {
      addEntryToDate(entryWithStatus, dateKey);
    }

    onFoodAdded();
  }

  function handleFilterChange(filterId) {
    setActiveFilter(filterId);

    if (!isEditing) {
      setSelectedFood(null);
    }
  }

  function handleCustomFoodSaved(food) {
    setCustomRefreshKey((key) => key + 1);
    setShowCustomForm(false);
    setEditingCustomFood(null);
    setSelectedFood(food);
  }

  function handleAddCustomFood() {
    setEditingCustomFood(null);
    setShowCustomForm(true);
  }

  function handleEditCustomFood(food) {
    setEditingCustomFood(food);
    setShowCustomForm(true);
  }

  function handleQuickAddFood(food) {
    setSelectedFood(food);
  }

  function handleChangeFood() {
    if (isEditing) {
      onBack();
      return;
    }

    setSelectedFood(null);
  }

  if (showCustomForm) {
    return (
      <CustomFoodForm
        editingFood={editingCustomFood}
        onCancel={() => {
          setShowCustomForm(false);
          setEditingCustomFood(null);
        }}
        onSaved={handleCustomFoodSaved}
      />
    );
  }

  if (selectedFood) {
    return (
      <SelectedFoodPanel
        food={selectedFood}
        editingEntry={editingEntry}
        mode={mode}
        initialMeal={initialMeal}
        onChangeFood={handleChangeFood}
        onAdd={handleAddOrUpdate}
      />
    );
  }

  return (
    <div className="space-y-4">
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

      <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="mb-3 px-3 py-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            {mode === "plan"
              ? editingEntry
                ? "Edit planned food"
                : "Add planned food"
              : editingEntry
                ? "Edit food item"
                : "Search for food items"}
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {mode === "plan"
              ? "Choose foods for a future meal plan."
              : editingEntry
                ? "Adjust the meal, portion or quantity and update the logged item."
                : "Search Indian foods, packaged foods, and custom foods."}
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

      {canSearch && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {getResultsTitle(activeFilter)}
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
                  onEditCustomFood={handleEditCustomFood}
                />
              ))}
            </div>
          ) : (
            <EmptySearchState
              activeFilter={activeFilter}
              onAddCustom={handleAddCustomFood}
            />
          )}
        </section>
      )}

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

          {activeFilter === "custom" && (
            <CustomFoodsSection
              allFoodsCount={customFoods.length}
              gramFoods={sortedGramCustomFoods}
              servingFoods={servingCustomFoods}
              sort={customSort}
              onSortChange={setCustomSort}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
              onEditCustomFood={handleEditCustomFood}
              onAddCustom={handleAddCustomFood}
            />
          )}

          {activeFilter !== "custom" && recentFoods.length > 0 && (
            <FoodSection
              title="Recent"
              foods={recentFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
              onEditCustomFood={handleEditCustomFood}
            />
          )}

          {activeFilter !== "custom" && frequentFoods.length > 0 && (
            <FoodSection
              title="Frequent"
              foods={frequentFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
              onEditCustomFood={handleEditCustomFood}
            />
          )}

          {(activeFilter === "all" || activeFilter === "indian") && (
            <FoodSection
              title="Popular Indian foods"
              foods={popularIndianFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
              onEditCustomFood={handleEditCustomFood}
            />
          )}

          {(activeFilter === "all" || activeFilter === "packaged") && (
            <FoodSection
              title="Common packaged foods"
              foods={popularPackagedFoods}
              onSelect={setSelectedFood}
              onQuickAdd={handleQuickAddFood}
              onEditCustomFood={handleEditCustomFood}
            />
          )}

          {!isEditing && activeFilter !== "custom" && (
            <button
              type="button"
              onClick={handleAddCustomFood}
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
          )}
        </section>
      )}
    </div>
  );
}

function FilterTabs({ activeFilter, onChange }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              className={`rounded-2xl px-2 py-2.5 text-left transition active:scale-[0.99] ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              <p className="text-xs font-black sm:text-sm">{filter.label}</p>

              <p
                className={`mt-0.5 hidden text-[10px] font-semibold sm:block ${
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

function CustomFoodsSection({
  allFoodsCount,
  gramFoods,
  servingFoods,
  sort,
  onSortChange,
  onSelect,
  onQuickAdd,
  onEditCustomFood,
  onAddCustom,
}) {
  const hasCustomFoods = allFoodsCount > 0;

  if (!hasCustomFoods) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-2xl">
          ✍️
        </div>

        <p className="mt-3 text-base font-black text-slate-900">
          No custom foods yet
        </p>

        <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
          Add foods you eat often but cannot find in the database.
        </p>

        <button
          type="button"
          onClick={onAddCustom}
          className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98]"
        >
          Add Custom Food
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Custom library
            </p>

            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              Custom foods
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Your saved foods are shown separately from INDB and packaged data.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-slate-100 px-3 py-2 text-center">
            <p className="text-lg font-black leading-none text-slate-800">
              {allFoodsCount}
            </p>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
              foods
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddCustom}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-sm active:scale-[0.98]"
        >
          <span className="text-base leading-none">+</span>
          <span>Add Custom Food</span>
        </button>
      </div>

      {gramFoods.length > 0 && (
        <section className="space-y-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-950">
                  Per 100g custom foods
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Macro sorting is applied only to foods entered on a 100g
                  basis.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                {gramFoods.length}
              </span>
            </div>

            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Sort by
              </span>

              <select
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-500"
              >
                {CUSTOM_SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <FoodSection
            title="Per 100g foods"
            foods={gramFoods}
            onSelect={onSelect}
            onQuickAdd={onQuickAdd}
            onEditCustomFood={onEditCustomFood}
          />
        </section>
      )}

      {servingFoods.length > 0 && (
        <section className="space-y-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-950">
                  Per serving custom foods
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  These remain available but are not macro-sorted because each
                  serving may mean a different quantity.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                {servingFoods.length}
              </span>
            </div>
          </div>

          <FoodSection
            title="Per serving foods"
            foods={servingFoods}
            onSelect={onSelect}
            onQuickAdd={onQuickAdd}
            onEditCustomFood={onEditCustomFood}
          />
        </section>
      )}
    </section>
  );
}

function FoodSection({ title, foods, onSelect, onQuickAdd, onEditCustomFood }) {
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
            onEditCustomFood={onEditCustomFood}
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
        {activeFilter === "packaged"
          ? "No packaged food found"
          : activeFilter === "custom"
            ? "No custom food found"
            : "No food found"}
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

  if (activeFilter === "custom") {
    return isCustomFood(food);
  }

  return true;
}

function isPer100gCustomFood(food) {
  return (
    isCustomFood(food) &&
    Number(food.caloriesPer100g || 0) > 0 &&
    food.defaultServing?.type !== "unit" &&
    !food.unitServing
  );
}

function sortCustomFoods(foods, sort) {
  const copiedFoods = [...foods];

  if (sort === "az") {
    return copiedFoods.sort((a, b) => {
      return getTextValue(a.shortName || a.name).localeCompare(
        getTextValue(b.shortName || b.name),
      );
    });
  }

  if (sort === "caloriesHigh") {
    return copiedFoods.sort((a, b) => {
      return getSortNutrition(b).calories - getSortNutrition(a).calories;
    });
  }

  if (sort === "caloriesLow") {
    return copiedFoods.sort((a, b) => {
      return getSortNutrition(a).calories - getSortNutrition(b).calories;
    });
  }

  if (sort === "proteinHigh") {
    return copiedFoods.sort((a, b) => {
      return getSortNutrition(b).protein - getSortNutrition(a).protein;
    });
  }

  if (sort === "carbsHigh") {
    return copiedFoods.sort((a, b) => {
      return getSortNutrition(b).carbs - getSortNutrition(a).carbs;
    });
  }

  if (sort === "fatHigh") {
    return copiedFoods.sort((a, b) => {
      return getSortNutrition(b).fat - getSortNutrition(a).fat;
    });
  }

  return copiedFoods.sort((a, b) => {
    return String(b.updatedAt || b.createdAt || "").localeCompare(
      String(a.updatedAt || a.createdAt || ""),
    );
  });
}

function getSortNutrition(food) {
  return {
    calories: Number(food.caloriesPer100g || 0),
    protein: Number(food.proteinPer100g || 0),
    carbs: Number(food.carbsPer100g || 0),
    fat: Number(food.fatPer100g || 0),
  };
}

function getResultsTitle(activeFilter) {
  if (activeFilter === "packaged") {
    return "Packaged results";
  }

  if (activeFilter === "custom") {
    return "Custom food results";
  }

  if (activeFilter === "indian") {
    return "Indian food results";
  }

  return "Search results";
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
