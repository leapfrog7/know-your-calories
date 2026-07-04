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

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeEntry(entry, dateKey) {
  return {
    ...entry,
    id: entry.id || createId(),
    date: entry.date || dateKey,
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

function normalizeDayLog(dayLog, fallbackDateKey) {
  const dateKey = dayLog?.date || fallbackDateKey;

  return {
    date: dateKey,
    entries: Array.isArray(dayLog?.entries)
      ? dayLog.entries.map((entry) => normalizeEntry(entry, dateKey))
      : [],
  };
}

function normalizeDays(daysInput) {
  const normalizedDays = {};

  if (Array.isArray(daysInput)) {
    daysInput.forEach((dayLog) => {
      if (!dayLog?.date) return;

      normalizedDays[dayLog.date] = normalizeDayLog(dayLog, dayLog.date);
    });

    return normalizedDays;
  }

  if (isPlainObject(daysInput)) {
    Object.entries(daysInput).forEach(([dateKey, dayLog]) => {
      normalizedDays[dateKey] = normalizeDayLog(dayLog, dateKey);
    });

    return normalizedDays;
  }

  return {};
}

export function getMealStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return DEFAULT_STORAGE;
  }

  try {
    const parsed = JSON.parse(raw);

    const normalizedDays = normalizeDays(parsed.days);

    return {
      ...DEFAULT_STORAGE,
      ...parsed,
      version: 1,
      days: normalizedDays,
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
  const safeStorage = {
    ...DEFAULT_STORAGE,
    ...storage,
    version: 1,
    days: normalizeDays(storage?.days),
    settings: {
      ...DEFAULT_STORAGE.settings,
      ...(storage?.settings || {}),
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeStorage));

  return safeStorage;
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

  const normalizedDayLog = normalizeDayLog(
    {
      ...dayLog,
      date: dateKey,
    },
    dateKey,
  );

  const updatedStorage = {
    ...storage,
    days: {
      ...storage.days,
      [dateKey]: normalizedDayLog,
    },
  };

  saveMealStorage(updatedStorage);

  return normalizedDayLog;
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
    entries: [...(dayLog.entries || []), nextEntry],
  };

  return saveDayLog(dateKey, updatedDayLog);
}

export function deleteEntryFromDate(entryId, dateKey = getTodayKey()) {
  const dayLog = getDayLog(dateKey);

  const updatedDayLog = {
    ...dayLog,
    entries: (dayLog.entries || []).filter((entry) => entry.id !== entryId),
  };

  return saveDayLog(dateKey, updatedDayLog);
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

export function replaceAllDays(importedDays) {
  const storage = getMealStorage();
  const normalizedDays = normalizeDays(importedDays);

  const updatedStorage = {
    ...storage,
    days: normalizedDays,
  };

  saveMealStorage(updatedStorage);

  return normalizedDays;
}

export function mergeImportedDays(importedDays) {
  const storage = getMealStorage();
  const existingDays = normalizeDays(storage.days);
  const incomingDays = normalizeDays(importedDays);

  const mergedDays = {
    ...existingDays,
  };

  Object.entries(incomingDays).forEach(([dateKey, incomingDayLog]) => {
    const existingDayLog = mergedDays[dateKey];

    if (!existingDayLog) {
      mergedDays[dateKey] = incomingDayLog;
      return;
    }

    const entryMap = new Map();

    (existingDayLog.entries || []).forEach((entry) => {
      if (entry?.id) {
        entryMap.set(entry.id, entry);
      }
    });

    (incomingDayLog.entries || []).forEach((entry) => {
      if (!entry?.id) return;

      if (!entryMap.has(entry.id)) {
        entryMap.set(entry.id, entry);
      }
    });

    mergedDays[dateKey] = {
      date: dateKey,
      entries: Array.from(entryMap.values()).sort((a, b) => {
        return String(a.createdAt || "").localeCompare(
          String(b.createdAt || ""),
        );
      }),
    };
  });

  const updatedStorage = {
    ...storage,
    days: mergedDays,
  };

  saveMealStorage(updatedStorage);

  return mergedDays;
}

export function clearMealStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMealStorageKey() {
  return STORAGE_KEY;
}

export function getMealSettings() {
  return getMealStorage().settings;
}

export function saveMealSettings(nextSettings) {
  const storage = getMealStorage();

  const updatedStorage = {
    ...storage,
    settings: {
      ...DEFAULT_STORAGE.settings,
      ...(storage.settings || {}),
      ...(nextSettings || {}),
    },
  };

  saveMealStorage(updatedStorage);

  return updatedStorage.settings;
}

export function resetMealSettings() {
  const storage = getMealStorage();

  const updatedStorage = {
    ...storage,
    settings: DEFAULT_STORAGE.settings,
  };

  saveMealStorage(updatedStorage);

  return updatedStorage.settings;
}
