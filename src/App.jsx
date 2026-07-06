import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import TodayPage from "./pages/TodayPage";
import HistoryPage from "./pages/HistoryPage";
import SummaryPage from "./pages/SummaryPage";
import SettingsPage from "./pages/SettingsPage";
import AddFoodScreen from "./features/food/AddFoodScreen";

function App() {
  const [activePage, setActivePage] = useState("today");
  const [quickFoodId, setQuickFoodId] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  function openAddFood(foodId = null, entry = null) {
    setQuickFoodId(foodId);
    setEditingEntry(entry);
    setActivePage("add-food");
  }

  function goToday() {
    setQuickFoodId(null);
    setEditingEntry(null);
    setActivePage("today");
  }

  function goSummary() {
    setQuickFoodId(null);
    setEditingEntry(null);
    setActivePage("summary");
  }

  function goHistory() {
    setQuickFoodId(null);
    setEditingEntry(null);
    setActivePage("history");
  }

  function goSettings() {
    setQuickFoodId(null);
    setEditingEntry(null);
    setActivePage("settings");
  }

  return (
    <AppShell
      activePage={activePage}
      onGoToday={goToday}
      onGoSummary={goSummary}
      onGoHistory={goHistory}
      onGoSettings={goSettings}
      onOpenAddFood={() => openAddFood()}
    >
      {activePage === "today" && <TodayPage onOpenAddFood={openAddFood} />}

      {activePage === "summary" && <SummaryPage />}

      {activePage === "history" && <HistoryPage />}

      {activePage === "settings" && <SettingsPage />}

      {activePage === "add-food" && (
        <AddFoodScreen
          initialFoodId={quickFoodId}
          editingEntry={editingEntry}
          onBack={goToday}
          onFoodAdded={goToday}
        />
      )}
    </AppShell>
  );
}

export default App;
