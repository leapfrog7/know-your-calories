export function formatWaterAmount(amountMl) {
  const safeAmount = Math.max(0, Number(amountMl) || 0);

  if (safeAmount >= 1000) {
    const litres = Number((safeAmount / 1000).toFixed(2));
    return `${litres} L`;
  }

  return `${Math.round(safeAmount)} ml`;
}

export function getHydrationPace({
  totalMl,
  targetMl,
  startTime = "07:00",
  endTime = "22:00",
  now = new Date(),
}) {
  const safeTotal = Math.max(0, Number(totalMl) || 0);
  const safeTarget = Math.max(1, Number(targetMl) || 2000);
  const startMinutes = parseTimeToMinutes(startTime, 7 * 60);
  const endMinutes = parseTimeToMinutes(endTime, 22 * 60);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const validWindow = endMinutes > startMinutes;
  const safeStart = validWindow ? startMinutes : 7 * 60;
  const safeEnd = validWindow ? endMinutes : 22 * 60;

  let expectedMl = 0;

  if (currentMinutes >= safeEnd) {
    expectedMl = safeTarget;
  } else if (currentMinutes > safeStart) {
    const elapsed = currentMinutes - safeStart;
    const duration = safeEnd - safeStart;
    expectedMl = Math.round(safeTarget * (elapsed / duration));
  }

  const deficitMl = Math.max(0, expectedMl - safeTotal);

  if (safeTotal >= safeTarget) {
    return {
      tone: "deepAqua",
      expectedMl,
      deficitMl: 0,
      message: "Daily target reached",
    };
  }

  if (currentMinutes < safeStart) {
    return {
      tone: "neutral",
      expectedMl: 0,
      deficitMl: 0,
      message: `Your hydration day starts at ${formatClockTime(startTime)}`,
    };
  }

  if (deficitMl <= 200) {
    return {
      tone: safeTotal >= expectedMl ? "deepAqua" : "aqua",
      expectedMl,
      deficitMl,
      message:
        safeTotal >= expectedMl
          ? "On pace for today"
          : "Close to today's pace",
    };
  }

  const coralThreshold = Math.min(750, safeTarget * 0.4);

  if (deficitMl > 400 && expectedMl >= coralThreshold) {
    return {
      tone: "coral",
      expectedMl,
      deficitMl,
      message: `${formatWaterAmount(deficitMl)} behind today's pace`,
    };
  }

  return {
    tone: "amber",
    expectedMl,
    deficitMl,
    message: "A little behind today's pace",
  };
}

export function formatClockTime(time) {
  const minutes = parseTimeToMinutes(time, 0);
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isValidHydrationWindow(startTime, endTime) {
  return (
    parseTimeToMinutes(endTime, 0) > parseTimeToMinutes(startTime, 0)
  );
}

function parseTimeToMinutes(time, fallbackMinutes) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(time || ""));
  if (!match) return fallbackMinutes;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return fallbackMinutes;
  return hours * 60 + minutes;
}
