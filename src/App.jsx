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

  function openAddFood(foodId = null) {
    setQuickFoodId(foodId);
    setActivePage("add-food");
  }

  function goToday() {
    setQuickFoodId(null);
    setActivePage("today");
  }

  function goSummary() {
    setQuickFoodId(null);
    setActivePage("summary");
  }

  function goHistory() {
    setQuickFoodId(null);
    setActivePage("history");
  }

  function goSettings() {
    setQuickFoodId(null);
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
          onBack={goToday}
          onFoodAdded={goToday}
        />
      )}
    </AppShell>
  );
}

export default App;
