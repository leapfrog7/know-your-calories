const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2";

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getProductName(product) {
  return (
    cleanText(product.product_name_en) ||
    cleanText(product.product_name) ||
    cleanText(product.generic_name_en) ||
    cleanText(product.generic_name) ||
    "Packaged food"
  );
}

function getBrand(product) {
  return cleanText(product.brands_tags?.[0]) || cleanText(product.brands);
}

function getServingQuantity(product) {
  const servingQuantity = toNumber(product.serving_quantity);

  if (servingQuantity > 0) {
    return servingQuantity;
  }

  const servingSize = cleanText(product.serving_size);
  const match = servingSize.match(/(\d+(\.\d+)?)\s*(g|ml)/i);

  if (match) {
    return toNumber(match[1]);
  }

  return 0;
}

function isValidNutrition(product) {
  const nutriments = product.nutriments || {};
  const calories = toNumber(nutriments["energy-kcal_100g"]);

  if (calories <= 0 || calories > 1000) {
    return false;
  }

  const protein = toNumber(nutriments.proteins_100g);
  const carbs = toNumber(nutriments.carbohydrates_100g);
  const fat = toNumber(nutriments.fat_100g);

  return protein > 0 || carbs > 0 || fat > 0;
}

function getPackagedCategory(product) {
  const categories = cleanText(product.categories).toLowerCase();

  if (categories.includes("biscuit") || categories.includes("cookie")) {
    return "Packaged Snacks";
  }

  if (categories.includes("chip") || categories.includes("snack")) {
    return "Packaged Snacks";
  }

  if (categories.includes("bread")) {
    return "Packaged Breads";
  }

  if (categories.includes("drink") || categories.includes("beverage")) {
    return "Drinks";
  }

  if (categories.includes("noodle") || categories.includes("ready")) {
    return "Packaged Meals";
  }

  return "Packaged Foods";
}

function isPackagedDrink(product) {
  const categories = cleanText(product.categories).toLowerCase();
  const name = getProductName(product).toLowerCase();
  const servingSize = cleanText(product.serving_size).toLowerCase();

  return (
    categories.includes("drink") ||
    categories.includes("beverage") ||
    categories.includes("soft drink") ||
    categories.includes("soda") ||
    categories.includes("juice") ||
    categories.includes("water") ||
    categories.includes("cola") ||
    name.includes("drink") ||
    name.includes("beverage") ||
    name.includes("cola") ||
    name.includes("juice") ||
    name.includes("water") ||
    servingSize.includes("ml") ||
    servingSize.includes("cl") ||
    servingSize.includes("l")
  );
}

function getServingDisplayUnit(product) {
  return isPackagedDrink(product) ? "ml" : "g";
}

function buildPackagedPortions(servingQuantity, servingLabel, displayUnit = "g") {
  if (displayUnit === "ml") {
    const beveragePortions = [
      { label: "100 ml", type: "grams", grams: 100, displayUnit: "ml" },
      { label: "150 ml", type: "grams", grams: 150, displayUnit: "ml" },
      { label: "250 ml", type: "grams", grams: 250, displayUnit: "ml" },
      { label: "500 ml", type: "grams", grams: 500, displayUnit: "ml" },
    ];

    if (servingQuantity > 0) {
      return [
        {
          label: servingLabel || `${servingQuantity} ml`,
          type: "grams",
          grams: servingQuantity,
          displayUnit: "ml",
        },
        ...beveragePortions.filter(
          (portion) => portion.grams !== servingQuantity
        ),
      ];
    }

    return beveragePortions;
  }

  const basePortions = [
    { label: "25g", type: "grams", grams: 25, displayUnit: "g" },
    { label: "50g", type: "grams", grams: 50, displayUnit: "g" },
    { label: "100g", type: "grams", grams: 100, displayUnit: "g" },
  ];

  if (servingQuantity > 0) {
    return [
      {
        label: servingLabel || "1 serving",
        type: "grams",
        grams: servingQuantity,
        displayUnit: "g",
      },
      ...basePortions.filter((portion) => portion.grams !== servingQuantity),
    ];
  }

  return basePortions;
}

export function normalizeOpenFoodFactsProduct(product) {
  if (!product || !isValidNutrition(product)) {
    return null;
  }

  const nutriments = product.nutriments || {};
  const barcode = cleanText(product.code);
  const name = getProductName(product);
  const brand = getBrand(product);
 const servingQuantity = getServingQuantity(product);
const servingSize = cleanText(product.serving_size);
const displayUnit = getServingDisplayUnit(product);

const servingLabel =
  servingQuantity > 0
    ? servingSize || `${servingQuantity}${displayUnit}`
    : `100${displayUnit}`;

  return {
    id: `off-${barcode || crypto.randomUUID()}`,
    source: "Open Food Facts",
    sourceFoodCode: barcode,
    barcode,
    brand,
    name: brand ? `${name} · ${brand}` : name,
    shortName: name,
    category: getPackagedCategory(product),
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: [name, brand, barcode].filter(Boolean).map((item) => item.toLowerCase()),

    caloriesPer100g: toNumber(nutriments["energy-kcal_100g"]),
    energyKjPer100g: toNumber(nutriments.energy_100g),
    proteinPer100g: toNumber(nutriments.proteins_100g),
    carbsPer100g: toNumber(nutriments.carbohydrates_100g),
    fatPer100g: toNumber(nutriments.fat_100g),
    freeSugarPer100g: toNumber(nutriments.sugars_100g),
servingUnitRaw: displayUnit,
servingUnitGroup: displayUnit === "ml" ? "drink" : "measure",

    unitServing: null,
    defaultServing: {
  label: servingLabel,
  type: "grams",
  grams: servingQuantity || 100,
  displayUnit,
},
   portions: buildPackagedPortions(servingQuantity, servingLabel, displayUnit),

    imageUrl: product.image_front_small_url || product.image_front_url || "",
    dataQuality: "open-food-facts",

    notes:
      "Open Food Facts label data. Values may vary by product version and label completeness.",
  };
}

export async function getOpenFoodFactsProductByBarcode(barcode) {
  const cleanBarcode = cleanText(barcode).replace(/\D/g, "");

  if (!cleanBarcode) {
    throw new Error("Enter a valid barcode.");
  }

  const fields = [
    "code",
    "product_name",
    "product_name_en",
    "generic_name",
    "generic_name_en",
    "brands",
    "brands_tags",
    "categories",
    "serving_size",
    "serving_quantity",
    "image_front_url",
    "image_front_small_url",
    "nutriments",
  ].join(",");

  const url = `${OFF_BASE_URL}/product/${cleanBarcode}.json?fields=${fields}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Could not reach Open Food Facts.");
  }

  const data = await response.json();

  if (data.status !== 1 || !data.product) {
    throw new Error("No product found for this barcode.");
  }

  const normalizedProduct = normalizeOpenFoodFactsProduct({
    ...data.product,
    code: data.code || cleanBarcode,
  });

  if (!normalizedProduct) {
    throw new Error("Product found, but nutrition data is incomplete.");
  }

  return normalizedProduct;
}

export async function searchOpenFoodFacts(query, options = {}) {
  const cleanQuery = cleanText(query);

  if (cleanQuery.length < 3) {
    throw new Error("Type at least 3 letters to search packaged foods.");
  }

  const fields = [
    "code",
    "product_name",
    "product_name_en",
    "generic_name",
    "generic_name_en",
    "brands",
    "brands_tags",
    "categories",
    "serving_size",
    "serving_quantity",
    "image_front_url",
    "image_front_small_url",
    "nutriments",
  ].join(",");

  const params = new URLSearchParams({
    search_terms: cleanQuery,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "10",
    fields,
  });

  const url = `${OFF_BASE_URL}/search?${params.toString()}`;

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Could not reach Open Food Facts.");
  }

  const data = await response.json();

  const products = Array.isArray(data.products) ? data.products : [];

  return products
    .map(normalizeOpenFoodFactsProduct)
    .filter(Boolean)
    .slice(0, 10);
}