import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import TodayPage from "./pages/TodayPage";
import PlanPage from "./pages/PlanPage";
import HistoryPage from "./pages/HistoryPage";
import SummaryPage from "./pages/SummaryPage";
import SettingsPage from "./pages/SettingsPage";
import AddFoodScreen from "./features/food/AddFoodScreen";

function App() {
  const [activePage, setActivePage] = useState("today");
  const [quickFoodId, setQuickFoodId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [targetDateKey, setTargetDateKey] = useState(null);
  const [addMode, setAddMode] = useState("today");

  function openAddFood(
    foodId = null,
    entry = null,
    nextTargetDateKey = null,
    nextAddMode = "today",
  ) {
    setQuickFoodId(foodId);
    setEditingEntry(entry);
    setTargetDateKey(nextTargetDateKey);
    setAddMode(nextAddMode);
    setActivePage("add-food");
  }

  function clearAddState() {
    setQuickFoodId(null);
    setEditingEntry(null);
    setTargetDateKey(null);
    setAddMode("today");
  }

  function goToday() {
    clearAddState();
    setActivePage("today");
  }

  function goPlan() {
    clearAddState();
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
    if (addMode === "plan") {
      goPlan();
      return;
    }

    goToday();
  }

  function handleBackFromAddFood() {
    if (addMode === "plan") {
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

      {activePage === "plan" && <PlanPage onOpenAddFood={openAddFood} />}

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