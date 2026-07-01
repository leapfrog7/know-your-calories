function BottomNav({ activePage, onGoToday, onGoSummary, onGoHistory }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 pb-4 pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2">
        <NavButton
          label="Today"
          active={activePage === "today"}
          onClick={onGoToday}
        />

        <NavButton
          label="Summary"
          active={activePage === "summary"}
          onClick={onGoSummary}
        />

        <NavButton
          label="History"
          active={activePage === "history"}
          onClick={onGoHistory}
        />
      </div>
    </nav>
  );
}

function NavButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-[0.98] ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

export default BottomNav;
