import fs from "fs";
import path from "path";

const INPUT_FILE = path.resolve("raw-data/packaged-barcodes.json");
const OUTPUT_FILE = path.resolve("src/data/packagedFoods.js");

const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2";

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProductName(product, fallbackName) {
  return (
    cleanText(product.product_name_en) ||
    cleanText(product.product_name) ||
    cleanText(product.generic_name_en) ||
    cleanText(product.generic_name) ||
    cleanText(fallbackName) ||
    "Packaged food"
  );
}

function getBrand(product, fallbackBrand) {
  return (
    cleanText(product.brands) ||
    cleanText(product.brands_tags?.[0]) ||
    cleanText(fallbackBrand)
  );
}

function isDrink(product, category) {
  const text = [
    product.product_name,
    product.product_name_en,
    product.categories,
    product.serving_size,
    category,
  ]
    .map(cleanText)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("drink") ||
    text.includes("beverage") ||
    text.includes("cola") ||
    text.includes("juice") ||
    text.includes("water") ||
    text.includes("soda") ||
    text.includes("ml") ||
    text.includes("soft drink")
  );
}

function getServingQuantity(product) {
  const servingQuantity = toNumber(product.serving_quantity);

  if (servingQuantity > 0) return servingQuantity;

  const servingSize = cleanText(product.serving_size);
  const match = servingSize.match(/(\d+(\.\d+)?)\s*(g|ml)/i);

  if (match) return toNumber(match[1]);

  return 0;
}

function getCategory(product, fallbackCategory) {
  const categories = cleanText(product.categories).toLowerCase();

  if (fallbackCategory) return fallbackCategory;

  if (categories.includes("biscuit") || categories.includes("cookie")) {
    return "Packaged Snacks";
  }

  if (categories.includes("chip") || categories.includes("snack")) {
    return "Packaged Snacks";
  }

  if (categories.includes("bread")) {
    return "Packaged Breads";
  }

  if (
    categories.includes("drink") ||
    categories.includes("beverage") ||
    categories.includes("juice") ||
    categories.includes("cola")
  ) {
    return "Drinks";
  }

  if (categories.includes("noodle") || categories.includes("ready")) {
    return "Packaged Meals";
  }

  if (categories.includes("chocolate")) {
    return "Chocolate";
  }

  if (categories.includes("dairy") || categories.includes("milk")) {
    return "Dairy";
  }

  return "Packaged Foods";
}

function hasUsableNutrition(product) {
  const nutriments = product.nutriments || {};

  const calories =
    toNumber(nutriments["energy-kcal_100g"]) ||
    toNumber(nutriments["energy-kcal"]);

  const protein = toNumber(nutriments.proteins_100g);
  const carbs = toNumber(nutriments.carbohydrates_100g);
  const fat = toNumber(nutriments.fat_100g);

  return calories > 0 && calories <= 1000 && (protein > 0 || carbs > 0 || fat > 0);
}

function buildPortions(product, category) {
  const servingQuantity = getServingQuantity(product);
  const servingSize = cleanText(product.serving_size);
  const displayUnit = isDrink(product, category) ? "ml" : "g";

  const basePortions =
    displayUnit === "ml"
      ? [
          { label: "100 ml", type: "grams", grams: 100, displayUnit: "ml" },
          { label: "150 ml", type: "grams", grams: 150, displayUnit: "ml" },
          { label: "250 ml", type: "grams", grams: 250, displayUnit: "ml" },
          { label: "500 ml", type: "grams", grams: 500, displayUnit: "ml" },
        ]
      : [
          { label: "25g", type: "grams", grams: 25, displayUnit: "g" },
          { label: "50g", type: "grams", grams: 50, displayUnit: "g" },
          { label: "100g", type: "grams", grams: 100, displayUnit: "g" },
        ];

  if (servingQuantity > 0) {
    const servingLabel = servingSize || `${servingQuantity}${displayUnit}`;

    return {
      displayUnit,
      defaultServing: {
        label: servingLabel,
        type: "grams",
        grams: servingQuantity,
        displayUnit,
      },
      portions: [
        {
          label: servingLabel,
          type: "grams",
          grams: servingQuantity,
          displayUnit,
        },
        ...basePortions.filter((portion) => portion.grams !== servingQuantity),
      ],
    };
  }

  return {
    displayUnit,
    defaultServing: {
      label: displayUnit === "ml" ? "100 ml" : "100g",
      type: "grams",
      grams: 100,
      displayUnit,
    },
    portions: basePortions,
  };
}

function buildAliases(name, brand, barcode) {
  const aliases = new Set();

  aliases.add(name.toLowerCase());
  aliases.add(brand.toLowerCase());
  aliases.add(barcode);

  name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .forEach((word) => aliases.add(word));

  brand
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .forEach((word) => aliases.add(word));

  return [...aliases].filter(Boolean);
}

function normalizeProduct(product, seed) {
  if (!product || !hasUsableNutrition(product)) return null;

  const barcode = cleanText(product.code || seed.barcode);
  const name = getProductName(product, seed.fallbackName);
  const brand = getBrand(product, seed.brand);
  const category = getCategory(product, seed.category);
  const nutriments = product.nutriments || {};
  const servingConfig = buildPortions(product, category);

  const caloriesPer100g =
    toNumber(nutriments["energy-kcal_100g"]) ||
    toNumber(nutriments["energy-kcal"]);

  return {
    id: `pkg-${slugify(`${barcode}-${name}`)}`,
    source: "Curated Packaged",
    sourceFoodCode: barcode,
    barcode,
    brand,
    name: brand ? `${name} · ${brand}` : name,
    shortName: name,
    category,
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: buildAliases(name, brand, barcode),

    caloriesPer100g,
    energyKjPer100g: toNumber(nutriments.energy_100g),
    proteinPer100g: toNumber(nutriments.proteins_100g),
    carbsPer100g: toNumber(nutriments.carbohydrates_100g),
    fatPer100g: toNumber(nutriments.fat_100g),
    freeSugarPer100g: toNumber(nutriments.sugars_100g),

    servingUnitRaw: servingConfig.displayUnit,
    servingUnitGroup: servingConfig.displayUnit === "ml" ? "drink" : "measure",

    unitServing: null,
    defaultServing: servingConfig.defaultServing,
    portions: servingConfig.portions,

    imageUrl: product.image_front_small_url || product.image_front_url || "",
    dataQuality: "curated-open-food-facts",

    notes:
      "Curated from Open Food Facts at build time. Check current packet label for exact variant.",
  };
}

async function fetchOffProduct(seed) {
  const barcode = cleanText(seed.barcode).replace(/\D/g, "");

  if (!barcode) return null;

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

  const url = `${OFF_BASE_URL}/product/${barcode}.json?fields=${fields}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "KnowYourCalories/1.0 (https://leapfrog7.github.io/know-your-calories)",
    },
  });

  if (!response.ok) {
    throw new Error(`OFF request failed for ${barcode}`);
  }

  const data = await response.json();

  if (data.status !== 1 || !data.product) {
    return null;
  }

  return {
    ...data.product,
    code: data.code || barcode,
  };
}

function ensureOutputDirectory() {
  const directory = path.dirname(OUTPUT_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`);
  }

  const seeds = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));

  if (!Array.isArray(seeds)) {
    throw new Error("packaged-barcodes.json must be an array.");
  }

  const foods = [];
  const failures = [];

  for (const seed of seeds) {
    try {
      console.log(`Fetching ${seed.barcode}...`);
      const product = await fetchOffProduct(seed);
      const food = normalizeProduct(product, seed);

      if (food) {
        foods.push(food);
      } else {
        failures.push({
          barcode: seed.barcode,
          fallbackName: seed.fallbackName,
          reason: "Not found or incomplete nutrition",
        });
      }
    } catch (error) {
      failures.push({
        barcode: seed.barcode,
        fallbackName: seed.fallbackName,
        reason: error.message,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const output = `// Auto-generated from raw-data/packaged-barcodes.json.
// Do not edit manually. Edit raw-data/packaged-barcodes.json and rerun npm.cmd run convert:packaged.

export const packagedFoods = ${JSON.stringify(foods, null, 2)};
`;

  ensureOutputDirectory();
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  const failureFile = path.resolve("raw-data/packaged-failures.json");
  fs.writeFileSync(failureFile, JSON.stringify(failures, null, 2), "utf8");

  console.log(`Converted ${foods.length} packaged foods.`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Written to: ${OUTPUT_FILE}`);
  console.log(`Failure report: ${failureFile}`);
}

main();