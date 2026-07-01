function MacroCard({ label, value, unit, helper }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
        {value}
        <span className="ml-1 text-sm font-bold text-slate-400">{unit}</span>
      </p>

      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

export default MacroCard;
