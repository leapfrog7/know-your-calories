import PropTypes from "prop-types";
import AppLogo from "../common/AppLogo";
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

  const headerSubtitle =
    activePage === "summary"
      ? "Nutrition Summary"
      : activePage === "history"
        ? "Food History"
        : activePage === "add-food"
          ? "Add Food"
          : "Daily Food Log";

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f7f7f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
          <AppLogo subtitle={headerSubtitle} />

          {activePage !== "add-food" && (
            <button
              type="button"
              onClick={onOpenAddFood}
              className="shrink-0 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.98]"
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

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
  activePage: PropTypes.string.isRequired,
  onGoToday: PropTypes.func.isRequired,
  onGoSummary: PropTypes.func.isRequired,
  onGoHistory: PropTypes.func.isRequired,
  onOpenAddFood: PropTypes.func.isRequired,
};

export default AppShell;