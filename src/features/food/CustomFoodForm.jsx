import { useState } from "react";
import { saveCustomFood, updateCustomFood } from "../../data/customFoodUtils";

const INITIAL_FORM = {
  entryMode: "per100g",
  name: "",
  brand: "",
  category: "Custom Foods",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  freeSugar: "",
  defaultGrams: "100",
  servingLabel: "1 serving",
};

function CustomFoodForm({ editingFood = null, onCancel, onSaved }) {
  const [form, setForm] = useState(() => buildInitialForm(editingFood));
  const [error, setError] = useState("");

  const isEditing = Boolean(editingFood);
  const isServingMode = form.entryMode === "serving";

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const food = isEditing
        ? updateCustomFood(editingFood.id, form)
        : saveCustomFood(form);

      onSaved(food);
    } catch (submitError) {
      setError(submitError.message || "Could not save custom food.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
            Custom food
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            {isEditing ? "Edit custom food" : "Add custom food"}
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {isEditing
              ? "Update this saved food. Existing meal logs will keep their earlier values."
              : "Use this when the food is not available in INDB or packaged lookup."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600 active:scale-[0.98]"
        >
          Close
        </button>
      </div>

      {isEditing && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold leading-relaxed text-amber-800">
          Editing changes the saved custom food for future use. It does not
          rewrite meals already logged earlier.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => updateField("entryMode", "per100g")}
            className={`rounded-xl px-3 py-3 text-sm font-black transition active:scale-[0.98] ${
              form.entryMode === "per100g"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Per 100g
          </button>

          <button
            type="button"
            onClick={() => updateField("entryMode", "serving")}
            className={`rounded-xl px-3 py-3 text-sm font-black transition active:scale-[0.98] ${
              form.entryMode === "serving"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Per serving
          </button>
        </div>

        <Field
          label="Food name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="e.g. Homemade sandwich"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Brand / source"
            value={form.brand}
            onChange={(value) => updateField("brand", value)}
            placeholder="Optional"
          />

          <Field
            label="Category"
            value={form.category}
            onChange={(value) => updateField("category", value)}
            placeholder="Custom Foods"
          />
        </div>

        {isServingMode ? (
          <Field
            label="Serving label"
            value={form.servingLabel}
            onChange={(value) => updateField("servingLabel", value)}
            placeholder="e.g. 1 piece, 1 bowl"
          />
        ) : (
          <Field
            label="Default serving grams"
            type="number"
            value={form.defaultGrams}
            onChange={(value) => updateField("defaultGrams", value)}
            placeholder="100"
          />
        )}

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">
            Nutrition {isServingMode ? "per serving" : "per 100g"}
          </p>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
            Enter approximate values. You can update them later.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field
              label="Calories"
              type="number"
              value={form.calories}
              onChange={(value) => updateField("calories", value)}
              placeholder="kcal"
              required
            />

            <Field
              label="Protein"
              type="number"
              value={form.protein}
              onChange={(value) => updateField("protein", value)}
              placeholder="g"
            />

            <Field
              label="Carbs"
              type="number"
              value={form.carbs}
              onChange={(value) => updateField("carbs", value)}
              placeholder="g"
            />

            <Field
              label="Fat"
              type="number"
              value={form.fat}
              onChange={(value) => updateField("fat", value)}
              placeholder="g"
            />

            <Field
              label="Free sugar"
              type="number"
              value={form.freeSugar}
              onChange={(value) => updateField("freeSugar", value)}
              placeholder="g"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-black text-white active:scale-[0.99]"
        >
          {isEditing ? "Update custom food" : "Save custom food"}
        </button>
      </form>
    </section>
  );
}

function buildInitialForm(editingFood) {
  if (!editingFood) {
    return INITIAL_FORM;
  }

  const isServingMode =
    editingFood.defaultServing?.type === "unit" ||
    editingFood.portions?.[0]?.type === "unit" ||
    Boolean(editingFood.unitServing);

  if (isServingMode) {
    const servingNutrition =
      editingFood.unitServing || editingFood.portions?.[0]?.nutrition || {};

    return {
      entryMode: "serving",
      name: editingFood.shortName || stripBrandFromName(editingFood),
      brand: editingFood.brand || "",
      category: editingFood.category || "Custom Foods",
      calories: toFormNumber(servingNutrition.calories),
      protein: toFormNumber(servingNutrition.protein),
      carbs: toFormNumber(servingNutrition.carbs),
      fat: toFormNumber(servingNutrition.fat),
      freeSugar: toFormNumber(servingNutrition.freeSugar),
      defaultGrams: "100",
      servingLabel:
        editingFood.defaultServing?.label ||
        editingFood.unitServing?.label ||
        editingFood.portions?.[0]?.label ||
        "1 serving",
    };
  }

  return {
    entryMode: "per100g",
    name: editingFood.shortName || stripBrandFromName(editingFood),
    brand: editingFood.brand || "",
    category: editingFood.category || "Custom Foods",
    calories: toFormNumber(editingFood.caloriesPer100g),
    protein: toFormNumber(editingFood.proteinPer100g),
    carbs: toFormNumber(editingFood.carbsPer100g),
    fat: toFormNumber(editingFood.fatPer100g),
    freeSugar: toFormNumber(editingFood.freeSugarPer100g),
    defaultGrams: toFormNumber(editingFood.defaultServing?.grams || 100),
    servingLabel: "1 serving",
  };
}

function stripBrandFromName(food) {
  const name = String(food?.name || "").trim();
  const brand = String(food?.brand || "").trim();

  if (!name) {
    return "";
  }

  if (!brand) {
    return name;
  }

  return name.replace(` · ${brand}`, "").trim();
}

function toFormNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return String(number);
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <input
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        required={required}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.1" : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none focus:border-emerald-500"
      />
    </label>
  );
}

export default CustomFoodForm;
