import { useState } from "react";
import { saveCustomFood } from "../../data/customFoodUtils";

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

function CustomFoodForm({ onCancel, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

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
      const food = saveCustomFood(form);
      onSaved(food);
    } catch (submitError) {
      setError(submitError.message || "Could not save custom food.");
    }
  }

  const isServingMode = form.entryMode === "serving";

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Add custom food
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use this when the food is not available in INDB or packaged lookup.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => updateField("entryMode", "per100g")}
            className={`rounded-xl px-3 py-3 text-sm font-black ${
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
            className={`rounded-xl px-3 py-3 text-sm font-black ${
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
          Save custom food
        </button>
      </form>
    </section>
  );
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
