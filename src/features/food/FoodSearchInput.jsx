function FoodSearchInput({ value, onChange, placeholder = "Search roti, dal, rice..." }) {
  return (
    <div>
      <label className="sr-only" htmlFor="food-search">
        Search food
      </label>

      <input
        id="food-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

export default FoodSearchInput;
