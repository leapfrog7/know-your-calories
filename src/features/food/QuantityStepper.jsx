function QuantityStepper({ value, onChange }) {
  function decrease() {
    onChange(Math.max(0.25, Number((value - 0.25).toFixed(2))));
  }

  function increase() {
    onChange(Number((value + 0.25).toFixed(2)));
  }

  return (
    <div>
      <p className="text-sm font-black text-slate-950">Quantity</p>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={decrease}
          className="h-14 w-14 rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 active:scale-[0.98]"
        >
          −
        </button>

        <input
          type="number"
          min="0.25"
          step="0.25"
          value={value}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            onChange(nextValue > 0 ? nextValue : 0.25);
          }}
          className="h-14 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white text-center text-lg font-black text-slate-950 outline-none focus:border-emerald-500"
        />

        <button
          type="button"
          onClick={increase}
          className="h-14 w-14 rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 active:scale-[0.98]"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default QuantityStepper;
