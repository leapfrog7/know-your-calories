function FoodSearchInput({ value, onChange }) {
  return (
    <div className="0 bg-white px-2 py-2 backdrop-blur-xl">
      <label className="sr-only" htmlFor="food-search">
        Search food
      </label>

      <input
        id="food-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search roti, dal, rice..."
        autoFocus
        className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-base font-semibold text-slate-950 outline-none shadow-sm placeholder:text-slate-400 focus:border-emerald-500"
      />
    </div>
  );
}

export default FoodSearchInput;
