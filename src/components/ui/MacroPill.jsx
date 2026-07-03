function MacroPill({
  label,
  value,
  unit,
  className = "bg-white/15",
  labelClassName = "text-emerald-50/80",
  valueClassName = "text-white",
  unitClassName = "text-emerald-50/80",
}) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${className}`}>
      <p className={`text-[11px] font-semibold ${labelClassName}`}>
        {label}
      </p>

      <p className={`mt-0.5 text-sm font-black ${valueClassName}`}>
        {value}
        <span className={`ml-0.5 text-xs font-semibold ${unitClassName}`}>
          {unit}
        </span>
      </p>
    </div>
  );
}

export default MacroPill;