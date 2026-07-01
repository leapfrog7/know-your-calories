function MacroPill({ label, value, unit }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2">
      <p className="text-[11px] font-semibold text-emerald-50/80">{label}</p>
      <p className="mt-0.5 text-sm font-black text-white">
        {value}
        <span className="ml-0.5 text-xs font-semibold text-emerald-50/80">
          {unit}
        </span>
      </p>
    </div>
  );
}

export default MacroPill;
