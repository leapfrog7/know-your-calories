import { useEffect, useRef, useState } from "react";
import { getWaterTotal } from "../../features/meals/mealStorage";
import {
  formatWaterAmount,
  getHydrationPace,
} from "../../features/hydration/hydrationHelpers";

const PRESET_AMOUNTS = [150, 250, 500];

function HydrationCard({
  waterEntries,
  targetMl,
  quickAddMl,
  dayStart,
  dayEnd,
  now,
  onAdd,
  onUndo,
}) {
  const [expanded, setExpanded] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const messageTimerRef = useRef(null);

  const totalMl = getWaterTotal(waterEntries);
  const safeTargetMl = Math.max(1, Number(targetMl) || 2000);
  const safeQuickAddMl = Math.max(1, Number(quickAddMl) || 250);
  const progress = Math.min(100, Math.round((totalMl / safeTargetMl) * 100));
  const pace = getHydrationPace({
    totalMl,
    targetMl: safeTargetMl,
    startTime: dayStart,
    endTime: dayEnd,
    now,
  });
  const tone = getToneClasses(pace.tone);

  useEffect(() => {
    return () => window.clearTimeout(messageTimerRef.current);
  }, []);

  function showMessage(nextMessage) {
    window.clearTimeout(messageTimerRef.current);
    setMessage(nextMessage);
    messageTimerRef.current = window.setTimeout(() => setMessage(""), 2500);
  }

  function addAmount(amountMl) {
    const safeAmount = Math.round(Number(amountMl));
    if (
      !Number.isFinite(safeAmount) ||
      safeAmount <= 0 ||
      safeAmount > 5000
    ) {
      return;
    }

    onAdd(safeAmount);
    showMessage(`${formatWaterAmount(safeAmount)} added`);
    setCustomAmount("");
  }

  function handleCustomAdd() {
    addAmount(customAmount);
  }

  function handleUndo() {
    onUndo();
    showMessage("Last water entry removed");
  }

  return (
    <section
      className={`relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-4 shadow-sm ${tone.border}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-200/35 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-20 w-[120%] rounded-[50%] bg-sky-100/55" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] text-white shadow-sm transition-colors ${tone.icon}`}
          >
            <WaterDropIcon />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                  Hydration
                </p>
                <p className="mt-0.5 text-lg font-black tracking-tight text-slate-950">
                  {formatWaterAmount(totalMl)}
                  <span className="ml-1 text-xs font-bold text-slate-400">
                    / {formatWaterAmount(safeTargetMl)}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => addAmount(safeQuickAddMl)}
                className="min-h-11 shrink-0 rounded-xl bg-cyan-600 px-3.5 py-2 text-sm font-black text-white outline-none transition active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-cyan-200"
              >
                + {formatWaterAmount(safeQuickAddMl)}
              </button>
            </div>

            <div
              className={`mt-2.5 h-2 overflow-hidden rounded-full ${tone.track}`}
              role="progressbar"
              aria-label="Daily water progress"
              aria-valuemin="0"
              aria-valuemax={safeTargetMl}
              aria-valuenow={Math.min(totalMl, safeTargetMl)}
            >
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-colors ${tone.progress}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p
            className={`min-w-0 truncate text-xs font-semibold transition-colors ${tone.text}`}
          >
            {message || pace.message}
          </p>

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="shrink-0 text-xs font-black text-cyan-700 underline decoration-cyan-300 underline-offset-4"
            aria-expanded={expanded}
          >
            {expanded ? "Done" : "More"}
          </button>
        </div>

        {expanded && (
          <div className="mt-3 border-t border-cyan-100 pt-3">
            <div className="mb-3 grid grid-cols-3 gap-2">
              <PaceValue label="Consumed" value={formatWaterAmount(totalMl)} />
              <PaceValue
                label="Expected now"
                value={formatWaterAmount(pace.expectedMl)}
              />
              <PaceValue
                label="Target"
                value={formatWaterAmount(safeTargetMl)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => addAmount(amount)}
                  className="rounded-2xl bg-cyan-50 px-2 py-2.5 text-xs font-black text-cyan-800 outline-none active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-cyan-100"
                >
                  + {amount} ml
                </button>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min="1"
                max="5000"
                inputMode="numeric"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder="Custom ml"
                aria-label="Custom water amount in millilitres"
                className="min-w-0 flex-1 rounded-2xl border border-cyan-100 bg-cyan-50/60 px-3 py-2.5 text-sm font-black text-slate-800 outline-none focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
              <button
                type="button"
                onClick={handleCustomAdd}
                disabled={
                  !Number(customAmount) ||
                  Number(customAmount) <= 0 ||
                  Number(customAmount) > 5000
                }
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {waterEntries.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="mt-2 w-full rounded-2xl px-3 py-2 text-xs font-black text-slate-400 underline decoration-slate-200 underline-offset-4"
              >
                Undo last addition
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function PaceValue({ label, value }) {
  return (
    <div className="rounded-2xl bg-cyan-50/60 px-2 py-2 text-center">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}

function getToneClasses(tone) {
  const tones = {
    neutral: {
      border: "border-cyan-100",
      icon: "bg-cyan-400 shadow-cyan-100",
      track: "bg-cyan-100",
      progress: "from-cyan-300 to-sky-400",
      text: "text-cyan-800/70",
    },
    aqua: {
      border: "border-cyan-200",
      icon: "bg-cyan-500 shadow-cyan-200",
      track: "bg-cyan-100",
      progress: "from-sky-400 to-cyan-500",
      text: "text-cyan-800",
    },
    deepAqua: {
      border: "border-cyan-300",
      icon: "bg-cyan-700 shadow-cyan-200",
      track: "bg-cyan-100",
      progress: "from-cyan-700 to-teal-500",
      text: "text-cyan-900",
    },
    amber: {
      border: "border-amber-200",
      icon: "bg-amber-400 shadow-amber-100",
      track: "bg-amber-100",
      progress: "from-amber-300 to-amber-500",
      text: "text-amber-700",
    },
    coral: {
      border: "border-rose-200",
      icon: "bg-rose-500 shadow-rose-100",
      track: "bg-rose-100",
      progress: "from-orange-400 to-rose-500",
      text: "text-rose-700",
    },
  };

  return tones[tone] || tones.aqua;
}

function WaterDropIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
    >
      <path
        d="M12 3.5C9.6 7 6.5 10.2 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10.2 14.4 7 12 3.5Z"
        fill="currentColor"
      />
      <path
        d="M9.2 14.2c.2 1.5 1.1 2.4 2.5 2.8"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export default HydrationCard;
