function QuantityStepper({ value, onChange }) {
  const MIN_VALUE = 0.25;
  const STEP = 0.25;

  const normalizedValue = Number(value) || MIN_VALUE;
  const isAtMinimum = normalizedValue <= MIN_VALUE;

  function formatValue(nextValue) {
    return Number(nextValue.toFixed(2));
  }

  function decrease() {
    const nextValue = Math.max(MIN_VALUE, normalizedValue - STEP);
    onChange(formatValue(nextValue));
  }

  function increase() {
    const nextValue = normalizedValue + STEP;
    onChange(formatValue(nextValue));
  }

  function handleInputChange(event) {
    const rawValue = event.target.value;

    if (rawValue === "") {
      onChange("");
      return;
    }

    const nextValue = Number(rawValue);

    if (!Number.isFinite(nextValue)) return;

    onChange(nextValue > 0 ? nextValue : MIN_VALUE);
  }

  function handleInputBlur() {
    if (!value || Number(value) < MIN_VALUE) {
      onChange(MIN_VALUE);
      return;
    }

    onChange(formatValue(Number(value)));
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">Quantity</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Adjust in 0.25 serving steps
          </p>
        </div>

        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          Serving
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={decrease}
          disabled={isAtMinimum}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label="Decrease quantity"
        >
          −
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="number"
            min={MIN_VALUE}
            step={STEP}
            inputMode="decimal"
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="h-12  w-full rounded-2xl border border-slate-200 bg-slate-50 text-center text-2xl font-black tracking-tight text-slate-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            aria-label="Quantity"
          />

          {/* <p className="mt-1 text-center text-[11px] font-semibold text-slate-400">
            Minimum {MIN_VALUE}
          </p> */}
        </div>

        <button
          type="button"
          onClick={increase}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-black text-white shadow-sm shadow-emerald-200 transition active:scale-[0.97]"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default QuantityStepper;