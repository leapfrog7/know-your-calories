import { indbFoods } from "./indbFoods";
import { packagedFoods } from "./packagedFoods";
import { getCustomFoods } from "./customFoodUtils";

export function getAllFoods() {
  return [...indbFoods, ...packagedFoods, ...getCustomFoods()];
}

export const foods = [...indbFoods, ...packagedFoods];

export function getFoodById(foodId) {
  return getAllFoods().find((food) => food.id === foodId) || null;
}

export function getFoodsBySource(source) {
  return getAllFoods().filter((food) => food.source === source);
}

export function getFoodsByCategory(category) {
  return getAllFoods().filter((food) => food.category === category);
}

export function getFoodCategories() {
  return [...new Set(getAllFoods().map((food) => food.category))].sort();
}
