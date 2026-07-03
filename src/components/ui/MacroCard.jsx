// function MacroCard({ label, value, unit, helper }) {
//   return (
//     <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
//       <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//         {label}
//       </p>

//       <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
//         {value}
//         <span className="ml-1 text-sm font-bold text-slate-400">{unit}</span>
//       </p>

//       {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
//     </div>
//   );
// }

// export default MacroCard;


function MacroCard({
  label,
  value,
  unit,
  helper,
  className = "border-slate-200/80 bg-white",
  labelClassName = "text-slate-400",
  valueClassName = "text-slate-950",
  unitClassName = "text-slate-400",
  helperClassName = "text-slate-500",
}) {
  return (
    <div
      className={`rounded-3xl border p-4 shadow-sm transition active:scale-[0.99] ${className}`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.14em] ${labelClassName}`}
      >
        {label}
      </p>

      <p className={`mt-2 text-2xl font-black tracking-tight ${valueClassName}`}>
        {value}
        <span className={`ml-1 text-sm font-bold ${unitClassName}`}>
          {unit}
        </span>
      </p>

      {helper && (
        <p className={`mt-1 text-xs font-medium ${helperClassName}`}>
          {helper}
        </p>
      )}
    </div>
  );
}

export default MacroCard;