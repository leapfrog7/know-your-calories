import { useEffect, useMemo, useState } from "react";
import { getFoodById } from "../../data/foods";
import {
  getFavoriteFoodIds,
  removeFavoriteFood,
} from "../../features/favorites/favoriteStorage";
import { calculateNutrition } from "../../features/meals/nutrition";

function QuickAddStrip({ foods, onSelectFood }) {
  const [mode, setMode] = useState("quick");
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteFoodIds());

  useEffect(() => {
    function handleFavoritesChanged() {
      setFavoriteIds(getFavoriteFoodIds());
    }

    window.addEventListener("kyc:favorites-changed", handleFavoritesChanged);

    return () => {
      window.removeEventListener(
        "kyc:favorites-changed",
        handleFavoritesChanged,
      );
    };
  }, []);

  const favoriteFoods = useMemo(() => {
    return favoriteIds.map(getFoodById).filter(Boolean);
  }, [favoriteIds]);

  const activeFoods = mode === "quick" ? foods : favoriteFoods;
  const hasQuickFoods = foods.length > 0;
  const hasFavoriteFoods = favoriteFoods.length > 0;

  function handleRemoveFavorite(event, foodId) {
    event.stopPropagation();

    removeFavoriteFood(foodId);
    setFavoriteIds(getFavoriteFoodIds());

    window.dispatchEvent(new Event("kyc:favorites-changed"));
  }

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Fast logging
          </p>

          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            {mode === "quick" ? "Quick Add" : "Favorites"}
          </h3>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {mode === "quick"
              ? "Recent and frequently logged foods."
              : "Foods you saved for repeated meals."}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {activeFoods.length}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <ShelfTab
          label="Quick ⚡️"
          active={mode === "quick"}
          onClick={() => setMode("quick")}
        />

        <ShelfTab
          label="Favorites 💗"
          active={mode === "favorites"}
          onClick={() => setMode("favorites")}
        />
      </div>

      {activeFoods.length === 0 ? (
        <EmptyShelf
          mode={mode}
          hasQuickFoods={hasQuickFoods}
          hasFavoriteFoods={hasFavoriteFoods}
        />
      ) : (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeFoods.map((food) => (
            <QuickFoodCard
              key={food.id}
              food={food}
              mode={mode}
              onSelectFood={onSelectFood}
              onRemoveFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ShelfTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-black transition active:scale-[0.98] ${
        active
          ? "bg-slate-800 text-white shadow-sm"
          : "text-slate-400 active:bg-white/70"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyShelf({ mode }) {
  return (
    <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
      <p className="text-2xl">{mode === "quick" ? "🍽️" : "⭐"}</p>

      <p className="mt-2 text-sm font-black text-slate-700">
        {mode === "quick" ? "No quick foods yet" : "No favorites yet"}
      </p>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
        {mode === "quick"
          ? "Log foods a few times and they will appear here."
          : "Tap the star on any food to save it here permanently."}
      </p>
    </div>
  );
}

function QuickFoodCard({ food, mode, onSelectFood, onRemoveFavorite }) {
  const defaultPortion = food.portions?.[0] || {
    label: "100g",
    type: "grams",
    grams: 100,
  };

  const nutrition = calculateNutrition(food, defaultPortion, 1);

  return (
    <button
      type="button"
      onClick={() => onSelectFood(food.id)}
      className="relative min-w-[155px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm transition active:scale-[0.98]"
    >
      {mode === "favorites" && (
        <span
          role="button"
          tabIndex={0}
          onClick={(event) => onRemoveFavorite(event, food.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onRemoveFavorite(event, food.id);
            }
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-amber-500 shadow-sm"
          aria-label={`Remove ${food.name} from favorites`}
        >
          ★
        </span>
      )}

      <p className="line-clamp-2 pr-7 text-sm font-black leading-tight text-slate-900">
        {food.shortName || food.name}
      </p>

      <p className="mt-2 text-xs font-semibold text-slate-400">
        {nutrition.calories} kcal · {defaultPortion.label}
      </p>

      {food.source && (
        <p className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
          {food.source}
        </p>
      )}
    </button>
  );
}

export default QuickAddStrip;
