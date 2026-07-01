function PortionSelector({ portions, selectedIndex, onChange }) {
  return (
    <div>
      <p className="text-sm font-black text-slate-950">Portion</p>

      <div className="mt-2 grid gap-2">
        {portions.map((portion, index) => (
          <button
            key={portion.label}
            type="button"
            onClick={() => onChange(index)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition active:scale-[0.99] ${
              selectedIndex === index
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {portion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PortionSelector;
