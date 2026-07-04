function BottomNav({
  activePage,
  onGoToday,
  onGoSummary,
  onGoHistory,
  onGoSettings,
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-50 px-2 py-1">
          <NavButton
            label="Today"
            emoji="♨️"
            active={activePage === "today"}
            onClick={onGoToday}
          />

          <NavButton
            label="Summary"
            emoji="📊"
            active={activePage === "summary"}
            onClick={onGoSummary}
          />

          <NavButton
            label="History"
            emoji="🕒"
            active={activePage === "history"}
            onClick={onGoHistory}
          />

          <NavButton
            label="Settings"
            emoji="⚙️"
            active={activePage === "settings"}
            onClick={onGoSettings}
          />
        </div>
      </div>
    </nav>
  );
}

function NavButton({ label, emoji, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[11px] font-black transition active:scale-[0.97] ${
        active
          ? "bg-black text-emerald-100 shadow-sm ring-1 ring-slate-200/70"
          : "text-slate-500 active:bg-slate/70 active:text-slate-700"
      }`}
    >
      <span
        className={`text-lg leading-none ${
          active ? "scale-110" : "grayscale opacity-70"
        }`}
        aria-hidden="true"
      >
        {emoji}
      </span>

      <span className="leading-none">{label}</span>
    </button>
  );
}

export default BottomNav;
