const STORAGE_KEY = "kyc_meal_entries";

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getAllMealEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getEntriesForDate(dateKey = getTodayKey()) {
  const allEntries = getAllMealEntries();
  return allEntries[dateKey] || [];
}

export function saveEntriesForDate(dateKey, entries) {
  const allEntries = getAllMealEntries();

  const updated = {
    ...allEntries,
    [dateKey]: entries,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function addEntryForToday(entry) {
  const todayKey = getTodayKey();
  const existingEntries = getEntriesForDate(todayKey);

  const updatedEntries = [
    ...existingEntries,
    {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    },
  ];

  saveEntriesForDate(todayKey, updatedEntries);

  return updatedEntries;
}

export function deleteEntryForToday(entryId) {
  const todayKey = getTodayKey();
  const existingEntries = getEntriesForDate(todayKey);

  const updatedEntries = existingEntries.filter(
    (entry) => entry.id !== entryId,
  );

  saveEntriesForDate(todayKey, updatedEntries);

  return updatedEntries;
}
