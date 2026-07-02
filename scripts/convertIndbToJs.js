import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const INPUT_FILE = path.resolve("raw-data/indb.xlsx");
const OUTPUT_FILE = path.resolve("src/data/indbFoods.js");

const REQUIRED_COLUMNS = [
  "food_code",
  "food_name",
  "primarysource",
  "energy_kj",
  "energy_kcal",
  "carb_g",
  "protein_g",
  "fat_g",
  "freesugar_g",
  "servings_unit",
  "unit_serving_energy_kj",
  "unit_serving_energy_kcal",
  "unit_serving_carb_g",
  "unit_serving_protein_g",
  "unit_serving_fat_g",
  "unit_serving_freesugar_g",
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const cleaned = String(value).replace(/,/g, "").trim();
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function roundNumber(value, digits = 2) {
  const number = toNumber(value);
  return Number(number.toFixed(digits));
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeRowKeys(row) {
  const normalized = {};

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = String(key || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    normalized[normalizedKey] = value;
  });

  return normalized;
}

function checkColumns(rows) {
  if (!rows.length) {
    throw new Error("No rows found in Excel sheet.");
  }

  const sampleRow = normalizeRowKeys(rows[0]);
  const availableColumns = Object.keys(sampleRow);

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !availableColumns.includes(column)
  );

  if (missingColumns.length > 0) {
    console.warn("Warning: Some expected columns were not found:");
    console.warn(missingColumns.join(", "));
    console.warn("\nAvailable columns are:");
    console.warn(availableColumns.join(", "));
    console.warn(
      "\nThe script will continue, but missing values will be set to 0/blank.\n"
    );
  }
}

function inferCategory(foodName) {
  const name = foodName.toLowerCase();

  if (
    name.includes("roti") ||
    name.includes("chapati") ||
    name.includes("phulka") ||
    name.includes("naan") ||
    name.includes("kulcha") ||
    name.includes("bhatura") ||
    name.includes("paratha") ||
    name.includes("parantha") ||
    name.includes("poori") ||
    name.includes("puri") ||
    name.includes("thepla") ||
    name.includes("khakhra")
  ) {
    return "Breads";
  }

  if (
    name.includes("rice") ||
    name.includes("chawal") ||
    name.includes("pulao") ||
    name.includes("biryani") ||
    name.includes("khichdi")
  ) {
    return "Rice";
  }

  if (
    name.includes("dal") ||
    name.includes("dhal") ||
    name.includes("rajma") ||
    name.includes("chole") ||
    name.includes("chana") ||
    name.includes("gram") ||
    name.includes("lentil") ||
    name.includes("sprout")
  ) {
    return "Dal & Legumes";
  }

  if (name.includes("paneer")) {
    return "Paneer";
  }

  if (
    name.includes("sabzi") ||
    name.includes("sabji") ||
    name.includes("bhaji") ||
    name.includes("vegetable") ||
    name.includes("aloo") ||
    name.includes("gobhi") ||
    name.includes("cauliflower") ||
    name.includes("bhindi") ||
    name.includes("brinjal") ||
    name.includes("baingan") ||
    name.includes("palak") ||
    name.includes("methi") ||
    name.includes("cabbage") ||
    name.includes("lauki") ||
    name.includes("bottle gourd")
  ) {
    return "Sabzi";
  }

  if (
    name.includes("tea") ||
    name.includes("chai") ||
    name.includes("coffee") ||
    name.includes("milk") ||
    name.includes("lassi") ||
    name.includes("juice") ||
    name.includes("sharbat") ||
    name.includes("drink")
  ) {
    return "Drinks";
  }

  if (
    name.includes("curd") ||
    name.includes("dahi") ||
    name.includes("yogurt") ||
    name.includes("yoghurt") ||
    name.includes("raita")
  ) {
    return "Dairy";
  }

  if (
    name.includes("halwa") ||
    name.includes("laddu") ||
    name.includes("ladoo") ||
    name.includes("kheer") ||
    name.includes("barfi") ||
    name.includes("burfi") ||
    name.includes("jalebi") ||
    name.includes("gulab") ||
    name.includes("rasgulla") ||
    name.includes("sweet")
  ) {
    return "Sweets";
  }

  if (
    name.includes("samosa") ||
    name.includes("pakora") ||
    name.includes("pakoda") ||
    name.includes("kachori") ||
    name.includes("chaat") ||
    name.includes("tikki") ||
    name.includes("namkeen") ||
    name.includes("snack")
  ) {
    return "Snacks";
  }

  if (
    name.includes("poha") ||
    name.includes("upma") ||
    name.includes("idli") ||
    name.includes("dosa") ||
    name.includes("chilla") ||
    name.includes("cheela") ||
    name.includes("daliya") ||
    name.includes("oats") ||
    name.includes("uttapam") ||
    name.includes("appam") ||
    name.includes("pesarattu")
  ) {
    return "Breakfast";
  }

  if (
    name.includes("egg") ||
    name.includes("chicken") ||
    name.includes("fish") ||
    name.includes("mutton") ||
    name.includes("meat") ||
    name.includes("kabab") ||
    name.includes("kebab")
  ) {
    return "Protein";
  }

  return "Indian Foods";
}

function inferCuisine(foodName) {
  const name = foodName.toLowerCase();

  if (
    name.includes("roti") ||
    name.includes("chapati") ||
    name.includes("paratha") ||
    name.includes("parantha") ||
    name.includes("rajma") ||
    name.includes("chole") ||
    name.includes("paneer") ||
    name.includes("naan") ||
    name.includes("kulcha") ||
    name.includes("bhatura") ||
    name.includes("lassi")
  ) {
    return "North Indian";
  }

  if (
    name.includes("idli") ||
    name.includes("dosa") ||
    name.includes("sambar") ||
    name.includes("rasam") ||
    name.includes("uttapam") ||
    name.includes("upma") ||
    name.includes("appam") ||
    name.includes("puttu") ||
    name.includes("pesarattu")
  ) {
    return "South Indian";
  }

  return "Indian";
}

function getServingUnitGroup(unitValue) {
  const unit = cleanText(unitValue).toLowerCase();

  if (!unit) return "grams";

  const drinkUnits = new Set([
    "tea cup",
    "cup",
    "glass",
    "tall glass",
    "juice glass",
    "tall stemmed glass",
    "half-pints",
    "ml",
  ]);

  const bowlDishUnits = new Set([
    "bowl",
    "small bowl",
    "soup bowl",
    "curry bowl",
    "dish",
    "shallow dish",
    "casserole dish",
    "small casserole dish",
    "souffle dish",
    "souffle cup",
    "ice-cream cup",
    "ice cream cup",
    "sundae glass",
    "small mould",
    "glass jar",
    "jar",
    "box",
  ]);

  const indianBreadUnits = new Set([
    "chapati",
    "roti",
    "parantha",
    "paratha",
    "naan",
    "bhatura",
    "poori",
    "puri",
    "thepla",
    "khakhra",
    "puttu",
    "appam",
    "dosa",
    "uttapam",
    "pesarattu",
    "cheela",
    "chilla",
  ]);

  const pieceUnits = new Set([
    "egg",
    "omelette",
    "pancake",
    "idli",
    "vada",
    "bonda",
    "samosa",
    "kachori",
    "cutlet",
    "toast",
    "burger",
    "spring roll",
    "tart",
    "pie",
    "puff",
    "éclair",
    "eclair",
    "patty",
    "swiss roll",
    "pastry",
    "cookie",
    "cookies",
    "biscuit",
    "muthia",
    "tikki",
    "dhokla",
    "sandwich",
    "hot dog bun",
    "bun",
    "cake",
    "bread roll",
    "piece",
    "large piece",
    "slice",
    "large slice",
    "finger",
    "square",
    "portion",
    "roll",
    "kaathi roll",
  ]);

  const proteinUnits = new Set([
    "chicken",
    "chicken breast",
    "chop",
    "chops",
    "kabab",
    "kebab",
    "gushtaba",
    "fish",
    "fillet",
    "joint",
  ]);

  const sweetUnits = new Set([
    "burfi",
    "barfi",
    "ladoo",
    "laddu",
    "gulab jamun",
    "kulfi",
    "gunjia",
    "malqura",
    "tukra",
    "candy",
  ]);

  const spoonUnits = new Set(["teaspoon", "tablespoon"]);
  const plateUnits = new Set(["plate", "small plate"]);

  const objectUnits = new Set([
    "capsicum",
    "brinjal",
    "tomato",
    "potato",
    "cauliflower steak",
    "stuffed tomato",
    "orange case",
    "shell",
    "basket",
    "nest",
  ]);

  const measureUnits = new Set(["gm", "gram", "grams", "g", "ml"]);

  if (drinkUnits.has(unit)) return "drink";
  if (bowlDishUnits.has(unit)) return "bowl-dish";
  if (indianBreadUnits.has(unit)) return "indian-bread";
  if (pieceUnits.has(unit)) return "piece";
  if (proteinUnits.has(unit)) return "protein-piece";
  if (sweetUnits.has(unit)) return "sweet-piece";
  if (spoonUnits.has(unit)) return "spoon";
  if (plateUnits.has(unit)) return "plate";
  if (objectUnits.has(unit)) return "object";
  if (measureUnits.has(unit)) return "measure";

  return "special";
}

function buildUnitServing(row) {
  const servingUnitRaw = cleanText(row.servings_unit);
  const calories = roundNumber(row.unit_serving_energy_kcal);

  if (!servingUnitRaw || calories <= 0) {
    return null;
  }

  return {
    label: `1 ${servingUnitRaw}`,
    unit: servingUnitRaw,
    energyKj: roundNumber(row.unit_serving_energy_kj),
    calories,
    carbs: roundNumber(row.unit_serving_carb_g),
    protein: roundNumber(row.unit_serving_protein_g),
    fat: roundNumber(row.unit_serving_fat_g),
    freeSugar: roundNumber(row.unit_serving_freesugar_g),
  };
}

function getGramPortionsForServingGroup(servingUnitGroup) {
  if (servingUnitGroup === "drink") {
    return [
      { label: "100 ml/g", type: "grams", grams: 100 },
      { label: "150 ml/g", type: "grams", grams: 150 },
      { label: "250 ml/g", type: "grams", grams: 250 },
    ];
  }

  if (
    servingUnitGroup === "indian-bread" ||
    servingUnitGroup === "piece" ||
    servingUnitGroup === "sweet-piece" ||
    servingUnitGroup === "protein-piece"
  ) {
    return [
      { label: "50g", type: "grams", grams: 50 },
      { label: "100g", type: "grams", grams: 100 },
      { label: "150g", type: "grams", grams: 150 },
    ];
  }

  if (servingUnitGroup === "bowl-dish" || servingUnitGroup === "plate") {
    return [
      { label: "100g", type: "grams", grams: 100 },
      { label: "150g", type: "grams", grams: 150 },
      { label: "200g", type: "grams", grams: 200 },
    ];
  }

  return [
    { label: "50g", type: "grams", grams: 50 },
    { label: "100g", type: "grams", grams: 100 },
    { label: "150g", type: "grams", grams: 150 },
    { label: "200g", type: "grams", grams: 200 },
  ];
}

function buildServingConfig(row) {
  const servingUnitRaw = cleanText(row.servings_unit);
  const servingUnitGroup = getServingUnitGroup(servingUnitRaw);
  const unitServing = buildUnitServing(row);

  if (unitServing) {
    return {
      servingUnitRaw,
      servingUnitGroup,
      unitServing,
      defaultServing: {
        label: unitServing.label,
        type: "unit",
      },
      portions: [
        {
          label: unitServing.label,
          type: "unit",
          nutrition: {
            calories: unitServing.calories,
            protein: unitServing.protein,
            carbs: unitServing.carbs,
            fat: unitServing.fat,
            freeSugar: unitServing.freeSugar,
          },
        },
      ],
    };
  }

  return {
    servingUnitRaw,
    servingUnitGroup,
    unitServing: null,
    defaultServing: {
      label: "100g",
      type: "grams",
      grams: 100,
    },
    portions: [
      { label: "50g", type: "grams", grams: 50 },
      { label: "100g", type: "grams", grams: 100 },
      { label: "150g", type: "grams", grams: 150 },
      { label: "200g", type: "grams", grams: 200 },
    ],
  };
}

function buildAliases(rawName, foodName) {
  const aliases = new Set();

  aliases.add(rawName.toLowerCase());
  aliases.add(foodName.toLowerCase());

  const lowerName = foodName.toLowerCase();

  if (lowerName.includes("chapati")) aliases.add("roti");
  if (lowerName.includes("roti")) aliases.add("chapati");
  if (lowerName.includes("parantha")) aliases.add("paratha");
  if (lowerName.includes("paratha")) aliases.add("parantha");
  if (lowerName.includes("tea")) aliases.add("chai");
  if (lowerName.includes("chai")) aliases.add("tea");
  if (lowerName.includes("curd")) aliases.add("dahi");
  if (lowerName.includes("dahi")) aliases.add("curd");
  if (lowerName.includes("rice")) aliases.add("chawal");
  if (lowerName.includes("egg")) aliases.add("anda");
  if (lowerName.includes("boiled egg")) aliases.add("ubla anda");

  return [...aliases].filter(Boolean);
}

function buildShortName(foodName) {
  return foodName
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDataQuality(row, unitServing) {
  if (unitServing) return "unit-serving";

  const calories = toNumber(row.energy_kcal);

  if (calories <= 0) return "needs-review";

  return "per-100g";
}

function buildFoodItem(row, index) {
  const normalizedRow = normalizeRowKeys(row);

  const rawName = cleanText(normalizedRow.food_name);
  const foodName = titleCase(rawName);
  const foodCode = cleanText(normalizedRow.food_code || index + 1);
  const primarySource = cleanText(normalizedRow.primarysource);

  const slug = slugify(`${foodCode}-${foodName}`);
  const servingConfig = buildServingConfig(normalizedRow);

  return {
    id: `indb-${slug}`,
    source: "INDB",
    sourceFoodCode: foodCode,
    primarySource,
    name: foodName,
    shortName: buildShortName(foodName),
    category: inferCategory(foodName),
    foodType: "recipe",
    cuisine: inferCuisine(foodName),
    aliases: buildAliases(rawName, foodName),

    servingUnitRaw: servingConfig.servingUnitRaw,
    servingUnitGroup: servingConfig.servingUnitGroup,

    caloriesPer100g: roundNumber(normalizedRow.energy_kcal),
    energyKjPer100g: roundNumber(normalizedRow.energy_kj),
    proteinPer100g: roundNumber(normalizedRow.protein_g),
    carbsPer100g: roundNumber(normalizedRow.carb_g),
    fatPer100g: roundNumber(normalizedRow.fat_g),
    freeSugarPer100g: roundNumber(normalizedRow.freesugar_g),

    unitServing: servingConfig.unitServing,
    defaultServing: servingConfig.defaultServing,
    portions: servingConfig.portions,

    dataQuality: getDataQuality(normalizedRow, servingConfig.unitServing),

   notes:
  servingConfig.unitServing
    ? "INDB standard serving used. Quantity can be adjusted by number of servings."
    : "INDB per-100g value used. Actual serving may vary by recipe, preparation and portion size.",
  };
}

function ensureOutputDirectory() {
  const outputDirectory = path.dirname(OUTPUT_FILE);

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }
}

function writeReviewReport(foods) {
  const reviewRows = foods
    .filter((food) => {
      const name = food.name.toLowerCase();

      const looksLikeEgg = name.includes("egg") || name.includes("anda");
      const suspiciousEgg =
        looksLikeEgg &&
        food.unitServing === null &&
        (food.proteinPer100g < 8 || food.caloriesPer100g < 100);

      const noUnitServing = !food.unitServing;

      return suspiciousEgg || noUnitServing;
    })
    .map((food) => ({
      id: food.id,
      name: food.name,
      servingUnitRaw: food.servingUnitRaw,
      servingUnitGroup: food.servingUnitGroup,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      dataQuality: food.dataQuality,
      reason: food.unitServing ? "check" : "no unit serving",
    }));

  const reportFile = path.resolve("raw-data/indb-review-report.json");
  fs.writeFileSync(reportFile, JSON.stringify(reviewRows, null, 2), "utf8");

  console.log(`Review report written to: ${reportFile}`);
}

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(
      `Input file not found: ${INPUT_FILE}\nPlace your Excel file at raw-data/indb.xlsx`
    );
  }

  const workbook = XLSX.readFile(INPUT_FILE);
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("No worksheet found in Excel file.");
  }

  const sheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  checkColumns(rows);

  const foods = rows
    .map(buildFoodItem)
    .filter((food) => food.name && (food.caloriesPer100g > 0 || food.unitServing));

  const duplicateIds = foods
    .map((food) => food.id)
    .filter((id, index, array) => array.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    console.warn("Duplicate IDs found:");
    console.warn([...new Set(duplicateIds)].join("\n"));
  }

  const output = `// Auto-generated from raw-data/indb.xlsx.
// Do not edit manually. Edit scripts/convertIndbToJs.js and rerun npm.cmd run convert:indb.

export const indbFoods = ${JSON.stringify(foods, null, 2)};
`;

  ensureOutputDirectory();
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  writeReviewReport(foods);

  console.log(`Converted ${foods.length} INDB foods.`);
  console.log(`Source worksheet: ${firstSheetName}`);
  console.log(`Written to: ${OUTPUT_FILE}`);
}

main();