import BottomNav from "./BottomNav";

function AppShell({
  children,
  activePage,
  onGoToday,
  onGoSummary,
  onGoHistory,
  onOpenAddFood,
}) {
  const showBottomNav = activePage !== "add-food";

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f7f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Know Your Calories
            </p>
            <h1 className="text-lg font-black tracking-tight text-slate-950">
              Daily Food Log
            </h1>
          </div>

          {activePage !== "add-food" && (
            <button
              type="button"
              onClick={onOpenAddFood}
              className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm active:scale-[0.98]"
            >
              + Add
            </button>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {children}
      </section>

      {showBottomNav && (
        <BottomNav
          activePage={activePage}
          onGoToday={onGoToday}
          onGoSummary={onGoSummary}
          onGoHistory={onGoHistory}
        />
      )}
    </main>
  );
}

export default AppShell;
