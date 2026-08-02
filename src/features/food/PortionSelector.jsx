function PortionSelector({ portions, selectedIndex, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-950">Portion</span>
      <span className="mt-0.5 block text-xs font-medium text-slate-500">
        Choose the serving shown on your plate.
      </span>
      <select
        value={selectedIndex}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        {portions.map((portion, index) => (
          <option key={`${portion.label}-${index}`} value={index}>
            {portion.label}{portion.type === "unit" ? " · standard serving" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export default PortionSelector;
