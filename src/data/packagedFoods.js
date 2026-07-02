export const packagedFoods = [
  {
    id: "off-marie-biscuit",
    source: "Open Food Facts",
    name: "Marie Biscuit",
    shortName: "Marie",
    category: "Packaged Snacks",
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: ["marie", "biscuit", "biscuits", "tea biscuit"],

    caloriesPer100g: 430,
    proteinPer100g: 7,
    carbsPer100g: 74,
    fatPer100g: 11,

    defaultServing: {
      label: "4 biscuits",
      grams: 30,
    },

    portions: [
      { label: "2 biscuits", grams: 15 },
      { label: "4 biscuits", grams: 30 },
      { label: "6 biscuits", grams: 45 },
      { label: "100g", grams: 100 },
    ],

    notes: "Packaged biscuit values vary by brand. Check label where available.",
  },
  {
    id: "off-potato-chips",
    source: "Open Food Facts",
    name: "Potato Chips",
    shortName: "Chips",
    category: "Packaged Snacks",
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: ["chips", "potato chips", "lays", "crisps"],

    caloriesPer100g: 540,
    proteinPer100g: 6,
    carbsPer100g: 53,
    fatPer100g: 34,

    defaultServing: {
      label: "1 small pack",
      grams: 30,
    },

    portions: [
      { label: "Small handful", grams: 20 },
      { label: "Small pack", grams: 30 },
      { label: "Medium pack", grams: 52 },
      { label: "100g", grams: 100 },
    ],

    notes: "Approximation for fried packaged potato chips.",
  },
  {
    id: "off-instant-noodles",
    source: "Open Food Facts",
    name: "Instant Noodles",
    shortName: "Noodles",
    category: "Packaged Meals",
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: ["instant noodles", "maggi", "noodles"],

    caloriesPer100g: 450,
    proteinPer100g: 8,
    carbsPer100g: 62,
    fatPer100g: 18,

    defaultServing: {
      label: "1 pack dry",
      grams: 70,
    },

    portions: [
      { label: "Half pack", grams: 35 },
      { label: "1 pack", grams: 70 },
      { label: "Large pack", grams: 100 },
    ],

    notes: "Dry packaged value. Cooked weight changes after adding water.",
  },
  {
    id: "off-white-bread",
    source: "Open Food Facts",
    name: "White Bread",
    shortName: "Bread",
    category: "Packaged Breads",
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: ["bread", "white bread", "slice bread"],

    caloriesPer100g: 265,
    proteinPer100g: 9,
    carbsPer100g: 49,
    fatPer100g: 3.2,

    defaultServing: {
      label: "2 slices",
      grams: 50,
    },

    portions: [
      { label: "1 slice", grams: 25 },
      { label: "2 slices", grams: 50 },
      { label: "4 slices", grams: 100 },
    ],

    notes: "Approximation for packaged white bread.",
  },
  {
    id: "off-cola",
    source: "Open Food Facts",
    name: "Cola / Soft Drink",
    shortName: "Cola",
    category: "Drinks",
    foodType: "packaged",
    cuisine: "Packaged",
    aliases: ["cola", "cold drink", "soft drink", "coke", "pepsi"],

    caloriesPer100g: 42,
    proteinPer100g: 0,
    carbsPer100g: 10.6,
    fatPer100g: 0,

    defaultServing: {
      label: "1 glass",
      grams: 250,
    },

    portions: [
      { label: "Small glass", grams: 150 },
      { label: "Glass", grams: 250 },
      { label: "500 ml bottle", grams: 500 },
    ],

    notes: "Approximation for regular sugary cola. Diet versions differ.",
  },
];