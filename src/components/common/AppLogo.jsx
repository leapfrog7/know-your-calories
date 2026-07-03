function AppLogo({ subtitle = "Daily Food Log", compact = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-emerald-100">
        <span aria-hidden="true">🥗</span>
      </div>

      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Know Your Calories
          </p>
          <h1 className="truncate text-lg font-black leading-6 tracking-tight text-slate-950">
            {subtitle}
          </h1>
        </div>
      )}
    </div>
  );
}

export default AppLogo;