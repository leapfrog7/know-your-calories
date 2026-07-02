import { indbFoods } from "./indbFoods";
import { packagedFoods } from "./packagedFoods";

export const foods = [...indbFoods, ...packagedFoods];

export function getFoodById(foodId) {
  return foods.find((food) => food.id === foodId) || null;
}

export function getFoodsBySource(source) {
  return foods.filter((food) => food.source === source);
}

export function getFoodsByCategory(category) {
  return foods.filter((food) => food.category === category);
}

export function getFoodCategories() {
  return [...new Set(foods.map((food) => food.category))].sort();
}