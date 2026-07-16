// import { getAllDays } from "../meals/mealStorage";
// import { getFavoriteFoodIds } from "../favorites/favoriteStorage";

// const BACKUP_APP_ID = "know-your-calories";
// const BACKUP_VERSION = 1;

// export function buildBackupPayload() {
//   return {
//     app: BACKUP_APP_ID,
//     version: BACKUP_VERSION,
//     exportedAt: new Date().toISOString(),
//     data: {
//       days: getAllDays(),
//       favorites: getFavoriteFoodIds(),
//     },
//   };
// }

// export function downloadBackupFile() {
//   const payload = buildBackupPayload();

//   const json = JSON.stringify(payload, null, 2);
//   const blob = new Blob([json], { type: "application/json" });

//   const url = URL.createObjectURL(blob);
//   const fileName = `know-your-calories-backup-${getTodayFileStamp()}.json`;

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = fileName;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   URL.revokeObjectURL(url);
// }

// export function parseBackupFile(file) {
//   return new Promise((resolve, reject) => {
//     if (!file) {
//       reject(new Error("No file selected."));
//       return;
//     }

//     if (!file.name.toLowerCase().endsWith(".json")) {
//       reject(new Error("Please select a valid JSON backup file."));
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = () => {
//       try {
//         const parsed = JSON.parse(reader.result);
//         const validated = validateBackupPayload(parsed);
//         resolve(validated);
//       } catch (error) {
//         reject(error);
//       }
//     };

//     reader.onerror = () => {
//       reject(new Error("Could not read the selected file."));
//     };

//     reader.readAsText(file);
//   });
// }

// export function validateBackupPayload(payload) {
//   if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
//     throw new Error("Invalid backup file.");
//   }

//   if (payload.app !== BACKUP_APP_ID) {
//     throw new Error("This file is not a Know Your Calories backup.");
//   }

//   if (!payload.data || typeof payload.data !== "object") {
//     throw new Error("Backup file does not contain valid meal data.");
//   }

//   const days = payload.data.days;

//   const daysIsObject = days && typeof days === "object" && !Array.isArray(days);

//   const daysIsArray = Array.isArray(days);

//   if (!daysIsObject && !daysIsArray) {
//     throw new Error("Backup file does not contain valid meal data.");
//   }

//   validateDays(days);

//   return payload;
// }

// function validateDays(days) {
//   const dayLogs = Array.isArray(days) ? days : Object.values(days);

//   dayLogs.forEach((dayLog) => {
//     if (!dayLog || typeof dayLog !== "object") {
//       throw new Error("Backup contains an invalid day log.");
//     }

//     if (!dayLog.date) {
//       throw new Error("Backup contains a day log without a date.");
//     }

//     if (!Array.isArray(dayLog.entries)) {
//       throw new Error("Backup contains a day log with invalid entries.");
//     }
//   });
// }

// function getTodayFileStamp() {
//   const now = new Date();

//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const date = String(now.getDate()).padStart(2, "0");

//   return `${year}-${month}-${date}`;
// }

import { getFavoriteFoodIds } from "../favorites/favoriteStorage";
import { getAllDays, getMealSettings } from "../meals/mealStorage";
import { getCustomFoods } from "../../data/customFoodUtils";

const BACKUP_APP_ID = "know-your-calories";
const BACKUP_VERSION = 2;
const LEGACY_BACKUP_REMINDER_KEY = "kyc_backup_reminder_v1";
const BACKUP_REMINDER_STATE_KEY = "kyc_backup_reminder_v2";
const BACKUP_REMINDER_INTERVAL_MS = 10 * 24 * 60 * 60 * 1000;
const BACKUP_SNOOZE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function buildBackupPayload() {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      days: getAllDays(),
      favorites: getFavoriteFoodIds(),
      customFoods: getCustomFoods(),
      settings: getMealSettings(),
    },
  };
}

export function downloadBackupFile() {
  const payload = buildBackupPayload();

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const fileName = `know-your-calories-backup-${getTodayFileStamp()}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  return markBackupCompleted(new Date(payload.exportedAt));
}

function readBackupReminderState() {
  const raw = localStorage.getItem(BACKUP_REMINDER_STATE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          lastBackupAt:
            typeof parsed.lastBackupAt === "string"
              ? parsed.lastBackupAt
              : null,
          remindAfter:
            typeof parsed.remindAfter === "string"
              ? parsed.remindAfter
              : null,
        };
      }
    } catch {
      // Fall through to the legacy value or an empty state.
    }
  }

  const legacyTime = Date.parse(
    localStorage.getItem(LEGACY_BACKUP_REMINDER_KEY) || "",
  );

  return {
    lastBackupAt: null,
    remindAfter: Number.isFinite(legacyTime)
      ? new Date(legacyTime + BACKUP_REMINDER_INTERVAL_MS).toISOString()
      : null,
  };
}

function saveBackupReminderState(state) {
  localStorage.setItem(BACKUP_REMINDER_STATE_KEY, JSON.stringify(state));
  localStorage.removeItem(LEGACY_BACKUP_REMINDER_KEY);
}

export function getBackupReminderStatus(now = new Date()) {
  const state = readBackupReminderState();
  const nowTime = now.getTime();
  const lastBackupTime = Date.parse(state.lastBackupAt || "");
  const remindAfterTime = Date.parse(state.remindAfter || "");
  const dateKeys = Object.keys(getAllDays()).filter((dateKey) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
  });

  if (dateKeys.length === 0) {
    return { shouldShow: false, lastBackupAt: state.lastBackupAt };
  }

  const oldestDate = new Date(`${dateKeys.sort()[0]}T00:00:00`);

  if (!Number.isFinite(oldestDate.getTime())) {
    return { shouldShow: false, lastBackupAt: state.lastBackupAt };
  }

  const backupIsRecent =
    Number.isFinite(lastBackupTime) &&
    lastBackupTime <= nowTime &&
    nowTime - lastBackupTime < BACKUP_REMINDER_INTERVAL_MS;
  const isSnoozed =
    Number.isFinite(remindAfterTime) && remindAfterTime > nowTime;
  const dataIsOldEnough =
    nowTime - oldestDate.getTime() >= BACKUP_REMINDER_INTERVAL_MS;

  return {
    shouldShow: dataIsOldEnough && !backupIsRecent && !isSnoozed,
    lastBackupAt: Number.isFinite(lastBackupTime)
      ? state.lastBackupAt
      : null,
  };
}

export function markBackupCompleted(now = new Date()) {
  const lastBackupAt = now.toISOString();
  saveBackupReminderState({ lastBackupAt, remindAfter: null });
  return lastBackupAt;
}

export function snoozeBackupReminder(now = new Date()) {
  const state = readBackupReminderState();
  const remindAfter = new Date(
    now.getTime() + BACKUP_SNOOZE_INTERVAL_MS,
  ).toISOString();

  saveBackupReminderState({ ...state, remindAfter });
  return remindAfter;
}

export function clearBackupReminderState() {
  localStorage.removeItem(BACKUP_REMINDER_STATE_KEY);
  localStorage.removeItem(LEGACY_BACKUP_REMINDER_KEY);
}

export function parseBackupFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected."));
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      reject(new Error("Please select a valid JSON backup file."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const validated = validateBackupPayload(parsed);
        resolve(validated);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Could not read the selected file."));
    };

    reader.readAsText(file);
  });
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid backup file.");
  }

  if (payload.app !== BACKUP_APP_ID) {
    throw new Error("This file is not a Know Your Calories backup.");
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("Backup file does not contain valid meal data.");
  }

  const days = payload.data.days;

  const daysIsObject = days && typeof days === "object" && !Array.isArray(days);

  const daysIsArray = Array.isArray(days);

  if (!daysIsObject && !daysIsArray) {
    throw new Error("Backup file does not contain valid meal data.");
  }

  validateDays(days);

  const favorites = Array.isArray(payload.data.favorites)
    ? payload.data.favorites.filter(Boolean)
    : [];

  const hasCustomFoods = Object.prototype.hasOwnProperty.call(
    payload.data,
    "customFoods",
  );

  if (hasCustomFoods && !Array.isArray(payload.data.customFoods)) {
    throw new Error("Backup contains invalid custom foods.");
  }

  const customFoods = (payload.data.customFoods || []).filter((food) => {
    return (
      food &&
      typeof food === "object" &&
      !Array.isArray(food) &&
      typeof food.id === "string" &&
      food.id.trim()
    );
  });

  const hasSettings = Object.prototype.hasOwnProperty.call(
    payload.data,
    "settings",
  );

  if (
    hasSettings &&
    (!payload.data.settings ||
      typeof payload.data.settings !== "object" ||
      Array.isArray(payload.data.settings))
  ) {
    throw new Error("Backup contains invalid meal settings.");
  }

  return {
    ...payload,
    data: {
      ...payload.data,
      favorites,
      customFoods,
      settings: hasSettings ? payload.data.settings : undefined,
    },
    compatibility: {
      hasCustomFoods,
      hasSettings,
    },
  };
}

function validateDays(days) {
  const dayLogs = Array.isArray(days) ? days : Object.values(days);

  dayLogs.forEach((dayLog) => {
    if (!dayLog || typeof dayLog !== "object") {
      throw new Error("Backup contains an invalid day log.");
    }

    if (!dayLog.date) {
      throw new Error("Backup contains a day log without a date.");
    }

    if (!Array.isArray(dayLog.entries)) {
      throw new Error("Backup contains a day log with invalid entries.");
    }
  });
}

function getTodayFileStamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}
