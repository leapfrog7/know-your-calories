function BottomNav({
  activePage,
  onGoToday,
  onGoPlan,
  onGoSummary,
  onGoHistory,
  onGoSettings,
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-5 gap-1 rounded-lg bg-slate-100 p-1.5">
          <NavButton
            label="Today"
            emoji="♨️"
            active={activePage === "today"}
            onClick={onGoToday}
          />

          <NavButton
            label="Plan"
            emoji="🗓️"
            active={activePage === "plan"}
            onClick={onGoPlan}
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
            emoji="🛠️"
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
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-black transition active:scale-[0.97] ${
        active
          ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-200/70"
          : "text-slate-500 active:bg-white/70 active:text-slate-700"
      }`}
    >
      <span
        className={`text-base leading-none ${active ? "scale-110" : "grayscale opacity-70"}`}
        aria-hidden="true"
      >
        {emoji}
      </span>

      <span className="leading-none text-sm lg:text-base">{label}</span>
    </button>
  );
}

export default BottomNav;