const CUSTOM_FOODS_KEY = "kyc_custom_foods_v1";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `custom-${crypto.randomUUID()}`;
  }

  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildAliases(name, brand = "") {
  return [name, brand]
    .map((item) => cleanText(item).toLowerCase())
    .filter(Boolean);
}

function getStoredCustomFoods() {
  const raw = localStorage.getItem(CUSTOM_FOODS_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredCustomFoods(foods) {
  localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
}

function normalizeCustomFoods(foods) {
  if (!Array.isArray(foods)) return [];

  const seenIds = new Set();

  return foods.filter((food) => {
    if (!food || typeof food !== "object" || Array.isArray(food)) return false;
    if (typeof food.id !== "string" || !food.id.trim()) return false;
    if (seenIds.has(food.id)) return false;

    seenIds.add(food.id);
    return true;
  });
}

function dispatchCustomFoodsUpdated() {
  window.dispatchEvent(new Event("kyc:custom-foods-updated"));
}

function buildGramPortions(defaultGrams = 100) {
  const portions = [
    { label: "50g", type: "grams", grams: 50, displayUnit: "g" },
    { label: "100g", type: "grams", grams: 100, displayUnit: "g" },
    { label: "150g", type: "grams", grams: 150, displayUnit: "g" },
    { label: "200g", type: "grams", grams: 200, displayUnit: "g" },
  ];

  if (
    defaultGrams > 0 &&
    !portions.some((portion) => portion.grams === defaultGrams)
  ) {
    return [
      {
        label: `${defaultGrams}g`,
        type: "grams",
        grams: defaultGrams,
        displayUnit: "g",
      },
      ...portions,
    ];
  }

  return portions;
}

function buildServingPortion(formData) {
  const servingLabel = cleanText(formData.servingLabel) || "1 serving";

  return {
    label: servingLabel,
    type: "unit",
    nutrition: {
      calories: toNumber(formData.calories),
      protein: toNumber(formData.protein),
      carbs: toNumber(formData.carbs),
      fat: toNumber(formData.fat),
      freeSugar: toNumber(formData.freeSugar),
    },
  };
}

function buildCustomFoodFromForm(formData, existingFood = null) {
  const name = cleanText(formData.name);
  const entryMode = formData.entryMode || "per100g";

  if (!name) {
    throw new Error("Food name is required.");
  }

  const calories = toNumber(formData.calories);

  if (calories <= 0) {
    throw new Error("Calories must be greater than zero.");
  }

  const id = existingFood?.id || createId();
  const now = new Date().toISOString();
  const category = cleanText(formData.category) || "Custom Foods";
  const brand = cleanText(formData.brand);

  if (entryMode === "serving") {
    const portion = buildServingPortion(formData);

    return {
      ...(existingFood || {}),
      id,
      source: "Custom",
      sourceFoodCode: id,
      barcode: "",
      brand,
      name: brand ? `${name} · ${brand}` : name,
      shortName: name,
      category,
      foodType: "custom",
      cuisine: "Custom",
      aliases: buildAliases(name, brand),

      caloriesPer100g: 0,
      energyKjPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      freeSugarPer100g: 0,

      servingUnitRaw: "serving",
      servingUnitGroup: "custom-serving",

      unitServing: {
        label: portion.label,
        unit: "serving",
        energyKj: 0,
        calories: portion.nutrition.calories,
        protein: portion.nutrition.protein,
        carbs: portion.nutrition.carbs,
        fat: portion.nutrition.fat,
        freeSugar: portion.nutrition.freeSugar,
      },

      defaultServing: {
        label: portion.label,
        type: "unit",
      },

      portions: [portion],

      dataQuality: "user-entered",
      createdAt: existingFood?.createdAt || now,
      updatedAt: existingFood ? now : undefined,
      notes: "User-created food. Nutrition entered per serving.",
    };
  }

  const defaultGrams = toNumber(formData.defaultGrams) || 100;

  return {
    ...(existingFood || {}),
    id,
    source: "Custom",
    sourceFoodCode: id,
    barcode: "",
    brand,
    name: brand ? `${name} · ${brand}` : name,
    shortName: name,
    category,
    foodType: "custom",
    cuisine: "Custom",
    aliases: buildAliases(name, brand),

    caloriesPer100g: toNumber(formData.calories),
    energyKjPer100g: 0,
    proteinPer100g: toNumber(formData.protein),
    carbsPer100g: toNumber(formData.carbs),
    fatPer100g: toNumber(formData.fat),
    freeSugarPer100g: toNumber(formData.freeSugar),

    servingUnitRaw: "g",
    servingUnitGroup: "measure",

    unitServing: null,

    defaultServing: {
      label: `${defaultGrams}g`,
      type: "grams",
      grams: defaultGrams,
      displayUnit: "g",
    },

    portions: buildGramPortions(defaultGrams),

    dataQuality: "user-entered",
    createdAt: existingFood?.createdAt || now,
    updatedAt: existingFood ? now : undefined,
    notes: "User-created food. Nutrition entered per 100g.",
  };
}

export function isCustomFood(food) {
  return food?.foodType === "custom" || food?.source === "Custom";
}

export function getCustomFoods() {
  return getStoredCustomFoods();
}

export function getCustomFoodById(foodId) {
  return getStoredCustomFoods().find((food) => food.id === foodId) || null;
}

export function saveCustomFood(formData) {
  const food = buildCustomFoodFromForm(formData);

  const currentFoods = getStoredCustomFoods();
  const nextFoods = [food, ...currentFoods];

  saveStoredCustomFoods(nextFoods);
  dispatchCustomFoodsUpdated();

  return food;
}

export function updateCustomFood(foodId, formData) {
  const currentFoods = getStoredCustomFoods();
  const existingFood = currentFoods.find((food) => food.id === foodId);

  if (!existingFood) {
    throw new Error("Custom food not found.");
  }

  const updatedFood = buildCustomFoodFromForm(formData, existingFood);

  const nextFoods = currentFoods.map((food) => {
    if (food.id !== foodId) {
      return food;
    }

    return updatedFood;
  });

  saveStoredCustomFoods(nextFoods);
  dispatchCustomFoodsUpdated();

  return updatedFood;
}

export function deleteCustomFood(foodId) {
  const currentFoods = getStoredCustomFoods();
  const nextFoods = currentFoods.filter((food) => food.id !== foodId);

  saveStoredCustomFoods(nextFoods);
  dispatchCustomFoodsUpdated();

  return nextFoods;
}

export function replaceCustomFoods(foods) {
  const normalizedFoods = normalizeCustomFoods(foods);
  saveStoredCustomFoods(normalizedFoods);
  dispatchCustomFoodsUpdated();
  return normalizedFoods;
}

export function mergeCustomFoods(foods) {
  const currentFoods = normalizeCustomFoods(getStoredCustomFoods());
  const currentIds = new Set(currentFoods.map((food) => food.id));
  const importedFoods = normalizeCustomFoods(foods).filter(
    (food) => !currentIds.has(food.id),
  );
  const mergedFoods = [...currentFoods, ...importedFoods];

  saveStoredCustomFoods(mergedFoods);
  dispatchCustomFoodsUpdated();
  return mergedFoods;
}

export function clearCustomFoods() {
  localStorage.removeItem(CUSTOM_FOODS_KEY);
  dispatchCustomFoodsUpdated();
}

export function getCustomFoodsStorageKey() {
  return CUSTOM_FOODS_KEY;
}
