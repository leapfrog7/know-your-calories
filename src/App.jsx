import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import TodayPage from "./pages/TodayPage";
import PlanPage from "./pages/PlanPage";
import HistoryPage from "./pages/HistoryPage";
import SummaryPage from "./pages/SummaryPage";
import SettingsPage from "./pages/SettingsPage";
import AddFoodScreen from "./features/food/AddFoodScreen";
import { getTodayKey, getTomorrowKey } from "./features/meals/mealHelpers";

function App() {
  const [activePage, setActivePage] = useState("today");
  const [quickFoodId, setQuickFoodId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [targetDateKey, setTargetDateKey] = useState(null);
  const [addMode, setAddMode] = useState("today");
  const [addReturnPage, setAddReturnPage] = useState("today");
  const [selectedPlanDateKey, setSelectedPlanDateKey] = useState(() =>
    getTomorrowKey(),
  );

  function openAddFood(
    foodId = null,
    entry = null,
    nextTargetDateKey = null,
    nextAddMode = "today",
    nextReturnPage = nextAddMode === "plan" ? "plan" : "today",
  ) {
    setQuickFoodId(foodId);
    setEditingEntry(entry);
    setTargetDateKey(nextTargetDateKey);
    setAddMode(nextAddMode);
    setAddReturnPage(nextReturnPage);
    setActivePage("add-food");
  }

  function clearAddState() {
    setQuickFoodId(null);
    setEditingEntry(null);
    setTargetDateKey(null);
    setAddMode("today");
    setAddReturnPage("today");
  }

  function goToday() {
    clearAddState();
    setActivePage("today");
  }

  function goPlan() {
    clearAddState();
    setSelectedPlanDateKey((currentDateKey) => {
      return currentDateKey < getTodayKey()
        ? getTomorrowKey()
        : currentDateKey;
    });
    setActivePage("plan");
  }

  function goSummary() {
    clearAddState();
    setActivePage("summary");
  }

  function goHistory() {
    clearAddState();
    setActivePage("history");
  }

  function goSettings() {
    clearAddState();
    setActivePage("settings");
  }

  function handleFoodAdded() {
    if (addReturnPage === "plan") {
      goPlan();
      return;
    }

    goToday();
  }

  function handleBackFromAddFood() {
    if (addReturnPage === "plan") {
      goPlan();
      return;
    }

    goToday();
  }

  return (
    <AppShell
      activePage={activePage}
      onGoToday={goToday}
      onGoPlan={goPlan}
      onGoSummary={goSummary}
      onGoHistory={goHistory}
      onGoSettings={goSettings}
      onOpenAddFood={() => openAddFood()}
    >
      {activePage === "today" && <TodayPage onOpenAddFood={openAddFood} />}

      {activePage === "plan" && (
        <PlanPage
          onOpenAddFood={openAddFood}
          selectedDateKey={selectedPlanDateKey}
          onSelectedDateChange={setSelectedPlanDateKey}
        />
      )}

      {activePage === "summary" && <SummaryPage />}

      {activePage === "history" && <HistoryPage />}

      {activePage === "settings" && <SettingsPage />}

      {activePage === "add-food" && (
        <AddFoodScreen
          initialFoodId={quickFoodId}
          editingEntry={editingEntry}
          targetDateKey={targetDateKey}
          mode={addMode}
          onBack={handleBackFromAddFood}
          onFoodAdded={handleFoodAdded}
        />
      )}
    </AppShell>
  );
}

export default App;
