import { getTodayKey } from "./mealHelpers";

const STORAGE_KEY = "kyc_daily_log_v1";
const CURRENT_STORAGE_VERSION = 3;

const DEFAULT_STORAGE = {
  version: CURRENT_STORAGE_VERSION,
  days: {},
  settings: {
    defaultCalorieTarget: 2000,
    defaultProteinTarget: 80,
    defaultWaterTargetMl: 2000,
    defaultWaterQuickAddMl: 250,
    hydrationDayStart: "07:00",
    hydrationDayEnd: "22:00",
    mealPlanMode: "time",
    mealTimes: {
      Breakfast: "06:00",
      Lunch: "12:00",
      "Evening Snack": "16:00",
      Dinner: "20:00",
    },
  },
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `entry_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createWaterId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `water-${crypto.randomUUID()}`;
  }

  return `water-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeEntry(entry, dateKey, options = {}) {
  const validStatuses = new Set(["planned", "consumed", "skipped"]);
  const inferredStatus =
    options.inferMissingStatus && dateKey > getTodayKey()
      ? "planned"
      : "consumed";

  return {
    ...entry,
    id: entry.id || createId(),
    date: entry.date || dateKey,
    createdAt: entry.createdAt || new Date().toISOString(),
    status: validStatuses.has(entry.status) ? entry.status : inferredStatus,
  };
}

function normalizeWaterEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => {
      return (
        entry &&
        typeof entry === "object" &&
        !Array.isArray(entry) &&
        Number.isFinite(Number(entry.amountMl)) &&
        Number(entry.amountMl) > 0
      );
    })
    .map((entry) => ({
      ...entry,
      id: entry.id || createWaterId(),
      amountMl: Math.round(Number(entry.amountMl)),
      createdAt: entry.createdAt || new Date().toISOString(),
    }));
}

function normalizeDayLog(dayLog, fallbackDateKey, options = {}) {
  const dateKey = dayLog?.date || fallbackDateKey;

  return {
    date: dateKey,
    entries: Array.isArray(dayLog?.entries)
      ? dayLog.entries.map((entry) => normalizeEntry(entry, dateKey, options))
      : [],
    waterEntries: normalizeWaterEntries(dayLog?.waterEntries),
  };
}

function normalizeDays(daysInput, options = {}) {
  const normalizedDays = {};

  if (Array.isArray(daysInput)) {
    daysInput.forEach((dayLog) => {
      if (!dayLog?.date) return;

      normalizedDays[dayLog.date] = normalizeDayLog(
        dayLog,
        dayLog.date,
        options,
      );
    });

    return normalizedDays;
  }

  if (isPlainObject(daysInput)) {
    Object.entries(daysInput).forEach(([dateKey, dayLog]) => {
      normalizedDays[dateKey] = normalizeDayLog(dayLog, dateKey, options);
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
    const isLegacyStorage =
      !Number.isFinite(Number(parsed.version)) ||
      Number(parsed.version) < CURRENT_STORAGE_VERSION;
    const normalizedDays = normalizeDays(parsed.days, {
      inferMissingStatus: isLegacyStorage,
    });

    const normalizedStorage = {
      ...DEFAULT_STORAGE,
      ...parsed,
      version: CURRENT_STORAGE_VERSION,
      days: normalizedDays,
      settings: {
        ...DEFAULT_STORAGE.settings,
        ...(parsed.settings || {}),
        mealTimes: {
          ...DEFAULT_STORAGE.settings.mealTimes,
          ...(parsed.settings?.mealTimes || {}),
        },
      },
    };

    if (isLegacyStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedStorage));
    }

    return normalizedStorage;
  } catch {
    return DEFAULT_STORAGE;
  }
}

export function saveMealStorage(storage) {
  const safeStorage = {
    ...DEFAULT_STORAGE,
    ...storage,
    version: CURRENT_STORAGE_VERSION,
    days: normalizeDays(storage?.days),
    settings: {
      ...DEFAULT_STORAGE.settings,
      ...(storage?.settings || {}),
      mealTimes: {
        ...DEFAULT_STORAGE.settings.mealTimes,
        ...(storage?.settings?.mealTimes || {}),
      },
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
      waterEntries: [],
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

export function updateEntryInDate(
  entryId,
  updatedEntry,
  dateKey = getTodayKey(),
) {
  const dayLog = getDayLog(dateKey);
  const now = new Date().toISOString();

  const updatedEntries = (dayLog.entries || []).map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }

    return {
      ...entry,
      ...updatedEntry,
      id: entry.id,
      date: entry.date || dateKey,
      createdAt: entry.createdAt || now,
      updatedAt: now,
    };
  });

  const updatedDayLog = {
    ...dayLog,
    entries: updatedEntries,
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
    .filter((dateKey) => dateKey <= getTodayKey())
    .sort()
    .reverse()
    .map((dateKey) => ({
      ...days[dateKey],
      entries: getConsumedEntries(days[dateKey]?.entries),
    }))
    .filter((dayLog) => {
      return dayLog.entries.length > 0 || dayLog.waterEntries.length > 0;
    });
}

export function replaceAllDays(importedDays) {
  const storage = getMealStorage();
  const normalizedDays = normalizeDays(importedDays, {
    inferMissingStatus: true,
  });

  const updatedStorage = {
    ...storage,
    days: normalizedDays,
  };

  saveMealStorage(updatedStorage);

  return normalizedDays;
}

export function clearEntriesForDate(dateKey = getTodayKey()) {
  const dayLog = getDayLog(dateKey);
  const updatedDayLog = {
    ...dayLog,
    date: dateKey,
    entries: [],
  };

  return saveDayLog(dateKey, updatedDayLog);
}

export function clearPlannedEntriesForDate(dateKey = getTodayKey()) {
  const dayLog = getDayLog(dateKey);
  const updatedDayLog = {
    ...dayLog,
    entries: (dayLog.entries || []).filter(
      (entry) => entry.status !== "planned" && entry.status !== "skipped",
    ),
  };

  return saveDayLog(dateKey, updatedDayLog);
}

export function updatePlannedMealStatus(
  meal,
  status,
  dateKey = getTodayKey(),
) {
  if (!["consumed", "skipped"].includes(status)) {
    return getDayLog(dateKey);
  }

  const dayLog = getDayLog(dateKey);
  const now = new Date().toISOString();
  const updatedDayLog = {
    ...dayLog,
    entries: (dayLog.entries || []).map((entry) => {
      if (entry.status !== "planned" || entry.meal !== meal) return entry;

      return {
        ...entry,
        status,
        updatedAt: now,
        ...(status === "consumed" ? { consumedAt: now } : { skippedAt: now }),
      };
    }),
  };

  return saveDayLog(dateKey, updatedDayLog);
}

export function mergeImportedDays(importedDays) {
  const storage = getMealStorage();
  const existingDays = normalizeDays(storage.days);
  const incomingDays = normalizeDays(importedDays, {
    inferMissingStatus: true,
  });

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
    const waterEntryMap = new Map();

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

    (existingDayLog.waterEntries || []).forEach((entry) => {
      if (entry?.id) waterEntryMap.set(entry.id, entry);
    });

    (incomingDayLog.waterEntries || []).forEach((entry) => {
      if (entry?.id && !waterEntryMap.has(entry.id)) {
        waterEntryMap.set(entry.id, entry);
      }
    });

    mergedDays[dateKey] = {
      date: dateKey,
      entries: Array.from(entryMap.values()).sort((a, b) => {
        return String(a.createdAt || "").localeCompare(
          String(b.createdAt || ""),
        );
      }),
      waterEntries: Array.from(waterEntryMap.values()).sort((a, b) => {
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
      mealTimes: {
        ...DEFAULT_STORAGE.settings.mealTimes,
        ...(storage.settings?.mealTimes || {}),
        ...(nextSettings?.mealTimes || {}),
      },
    },
  };

  saveMealStorage(updatedStorage);

  return updatedStorage.settings;
}

export function getConsumedEntries(entries = []) {
  return entries.filter((entry) => {
    return entry?.status !== "planned" && entry?.status !== "skipped";
  });
}

export function getPlannedEntries(entries = []) {
  return entries.filter((entry) => entry?.status === "planned");
}

export function addWaterToDate(amountMl, dateKey = getTodayKey()) {
  const safeAmountMl = Math.round(Number(amountMl));
  if (!Number.isFinite(safeAmountMl) || safeAmountMl <= 0) {
    return getDayLog(dateKey);
  }

  const dayLog = getDayLog(dateKey);
  const waterEntry = {
    id: createWaterId(),
    amountMl: safeAmountMl,
    createdAt: new Date().toISOString(),
  };

  return saveDayLog(dateKey, {
    ...dayLog,
    waterEntries: [...(dayLog.waterEntries || []), waterEntry],
  });
}

export function undoLastWaterEntry(dateKey = getTodayKey()) {
  const dayLog = getDayLog(dateKey);
  const waterEntries = [...(dayLog.waterEntries || [])];

  waterEntries.pop();

  return saveDayLog(dateKey, {
    ...dayLog,
    waterEntries,
  });
}

export function getWaterTotal(waterEntries = []) {
  return waterEntries.reduce((total, entry) => {
    return total + (Number(entry?.amountMl) || 0);
  }, 0);
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
