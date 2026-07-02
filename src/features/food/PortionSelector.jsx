function PortionSelector({ portions, selectedIndex, onChange }) {
  return (
    <div>
      <p className="text-sm font-black text-slate-950">Portion</p>

      <div className="mt-2 grid gap-2">
        {portions.map((portion, index) => (
          <button
            key={`${portion.label}-${index}`}
            type="button"
            onClick={() => onChange(index)}
            className={`rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] ${
              selectedIndex === index
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <p className="text-sm font-black">{portion.label}</p>
            <p className="mt-0.5 text-xs font-semibold opacity-70">
              {portion.type === "unit" ? "INDB standard serving" : "Gram option"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PortionSelector;