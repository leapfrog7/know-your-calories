import { getTodayKey } from "./mealHelpers";

const STORAGE_KEY = "kyc_daily_log_v1";

const DEFAULT_STORAGE = {
  version: 1,
  days: {},
  settings: {
    defaultCalorieTarget: 2000,
    defaultProteinTarget: 80,
  },
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `entry_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getMealStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return DEFAULT_STORAGE;
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_STORAGE,
      ...parsed,
      days: parsed.days || {},
      settings: {
        ...DEFAULT_STORAGE.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch {
    return DEFAULT_STORAGE;
  }
}

export function saveMealStorage(storage) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...DEFAULT_STORAGE,
      ...storage,
      version: 1,
    }),
  );
}

export function getDayLog(dateKey = getTodayKey()) {
  const storage = getMealStorage();

  return (
    storage.days[dateKey] || {
      date: dateKey,
      entries: [],
    }
  );
}

export function getTodayLog() {
  return getDayLog(getTodayKey());
}

export function saveDayLog(dateKey, dayLog) {
  const storage = getMealStorage();

  const updatedStorage = {
    ...storage,
    days: {
      ...storage.days,
      [dateKey]: {
        date: dateKey,
        entries: dayLog.entries || [],
      },
    },
  };

  saveMealStorage(updatedStorage);
  return updatedStorage.days[dateKey];
}

export function addEntryToDate(entry, dateKey = getTodayKey()) {
  const dayLog = getDayLog(dateKey);

  const nextEntry = {
    ...entry,
    id: createId(),
    date: dateKey,
    createdAt: new Date().toISOString(),
  };

  const updatedDayLog = {
    ...dayLog,
    entries: [...dayLog.entries, nextEntry],
  };

  saveDayLog(dateKey, updatedDayLog);

  return updatedDayLog;
}

export function deleteEntryFromDate(entryId, dateKey = getTodayKey()) {
  const dayLog = getDayLog(dateKey);

  const updatedDayLog = {
    ...dayLog,
    entries: dayLog.entries.filter((entry) => entry.id !== entryId),
  };

  saveDayLog(dateKey, updatedDayLog);

  return updatedDayLog;
}

export function getAllDays() {
  return getMealStorage().days;
}

export function getSortedDayLogs() {
  const days = getAllDays();

  return Object.keys(days)
    .sort()
    .reverse()
    .map((dateKey) => days[dateKey]);
}
