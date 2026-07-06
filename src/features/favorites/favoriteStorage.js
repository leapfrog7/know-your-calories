const FAVORITES_KEY = "kyc_favorite_food_ids_v1";

export function getFavoriteFoodIds() {
  const raw = localStorage.getItem(FAVORITES_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

export function saveFavoriteFoodIds(foodIds) {
  const uniqueIds = [...new Set((foodIds || []).filter(Boolean))];

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueIds));

  return uniqueIds;
}

export function isFavoriteFood(foodId) {
  if (!foodId) return false;

  return getFavoriteFoodIds().includes(foodId);
}

export function addFavoriteFood(foodId) {
  if (!foodId) return getFavoriteFoodIds();

  const currentIds = getFavoriteFoodIds();

  if (currentIds.includes(foodId)) {
    return currentIds;
  }

  return saveFavoriteFoodIds([foodId, ...currentIds]);
}

export function removeFavoriteFood(foodId) {
  if (!foodId) return getFavoriteFoodIds();

  const currentIds = getFavoriteFoodIds();

  return saveFavoriteFoodIds(currentIds.filter((id) => id !== foodId));
}

export function toggleFavoriteFood(foodId) {
  if (!foodId) return getFavoriteFoodIds();

  if (isFavoriteFood(foodId)) {
    return removeFavoriteFood(foodId);
  }

  return addFavoriteFood(foodId);
}

export function clearFavoriteFoods() {
  localStorage.removeItem(FAVORITES_KEY);
}
