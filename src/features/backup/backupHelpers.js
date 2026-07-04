import { getAllDays } from "../meals/mealStorage";

const BACKUP_APP_ID = "know-your-calories";
const BACKUP_VERSION = 1;

export function buildBackupPayload() {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      days: getAllDays(),
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

  return payload;
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
