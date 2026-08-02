import { useMemo, useState } from "react";
import { getAllDays, getMealSettings } from "../features/meals/mealStorage";
import { buildPeriodSummary } from "../features/meals/summaryHelpers";
import { formatDisplayDate } from "../features/meals/mealHelpers";
import { formatWaterAmount } from "../features/hydration/hydrationHelpers";

const METRICS = {
  calories: { label: "Calories", unit: "kcal", color: "bg-emerald-600", soft: "bg-emerald-100", value: (day) => day.totals.calories, target: "calorieTarget" },
  protein: { label: "Protein", unit: "g", color: "bg-indigo-600", soft: "bg-indigo-100", value: (day) => day.totals.protein, target: "proteinTarget" },
  water: { label: "Water", unit: "ml", color: "bg-cyan-600", soft: "bg-cyan-100", value: (day) => day.waterMl, target: "waterTarget" },
};

function SummaryPage() {
  const [mode, setMode] = useState("week");
  const [metric, setMetric] = useState("calories");
  const [selectedDate, setSelectedDate] = useState(null);
  const [foodMode, setFoodMode] = useState("frequent");

  const summary = useMemo(
    () => buildPeriodSummary(getAllDays(), mode, getMealSettings()),
    [mode],
  );
  const title = mode === "week" ? "This Week" : "This Month";
  const selectedDay = summary.dailyRows.find((day) => day.date === selectedDate)
    || [...summary.dailyRows].reverse().find((day) => day.hasLog || day.waterMl > 0)
    || summary.dailyRows.at(-1);

  function changeMode(nextMode) {
    setMode(nextMode);
    setSelectedDate(null);
  }

  return (
    <div className="space-y-5 pb-28">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Trends</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight">{title}</h2>
              <p className="mt-2 text-sm font-medium text-slate-400">
                {formatDisplayDate(summary.startDate)} to {formatDisplayDate(summary.endDate)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/10">
              <p className="text-lg font-black leading-none">{summary.loggedDayCount}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">logged days</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1">
            <PeriodButton label="This Week" active={mode === "week"} onClick={() => changeMode("week")} />
            <PeriodButton label="This Month" active={mode === "month"} onClick={() => changeMode("month")} />
          </div>
        </div>
      </section>

      <TrendChart
        summary={summary}
        metric={metric}
        onMetricChange={setMetric}
        selectedDay={selectedDay}
        onDaySelect={(day) => setSelectedDate(day.date)}
      />

      <OnTrackSection summary={summary} />
      <ComparisonSection summary={summary} mode={mode} />
      <InsightSection insights={summary.insights} />
      <MealDistribution mealCalories={summary.mealCalories} />
      <FoodPatterns summary={summary} mode={foodMode} onModeChange={setFoodMode} />
    </div>
  );
}

function TrendChart({ summary, metric, onMetricChange, selectedDay, onDaySelect }) {
  const config = METRICS[metric];
  const target = summary.targets[config.target];
  const values = summary.dailyRows.map((day) => config.value(day));
  const loggedValues = summary.dailyRows
    .filter((day) => metric === "water" ? day.waterMl > 0 : day.hasLog)
    .map((day) => config.value(day));
  const average = loggedValues.length
    ? Math.round(loggedValues.reduce((total, value) => total + value, 0) / loggedValues.length)
    : 0;
  const maxValue = Math.max(target, average, ...values, 1) * 1.12;
  const targetPosition = Math.min(95, (target / maxValue) * 100);
  const averagePosition = Math.min(95, (average / maxValue) * 100);
  const selectedValue = selectedDay ? config.value(selectedDay) : 0;
  const selectedHasValue = selectedDay && (metric === "water" ? selectedDay.waterMl > 0 : selectedDay.hasLog);

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">Daily trend</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Tap a bar to inspect that day.</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-slate-950">{average.toLocaleString("en-IN")}</p>
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">avg {config.unit}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {Object.entries(METRICS).map(([key, item]) => (
          <button key={key} type="button" onClick={() => onMetricChange(key)} className={`min-h-10 rounded-lg px-2 text-xs font-black transition ${metric === key ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className={`relative h-48 border-b border-slate-200 ${summary.mode === "month" ? "min-w-[780px]" : "min-w-full"}`}>
        <ReferenceLine position={targetPosition} label={`Target ${formatMetric(target, config.unit)}`} dashed />
        {average > 0 && <ReferenceLine position={averagePosition} label="Average" />}
        <div className="absolute inset-x-0 bottom-0 top-5 flex items-end gap-1">
          {summary.dailyRows.map((day, index) => {
            const value = config.value(day);
            const hasValue = metric === "water" ? day.waterMl > 0 : day.hasLog;
            const height = hasValue ? Math.max(4, (value / maxValue) * 100) : 0;
            const active = selectedDay?.date === day.date;
            return (
              <button key={day.date} type="button" onClick={() => onDaySelect(day)} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end" aria-label={`${formatDisplayDate(day.date)}, ${hasValue ? formatMetric(value, config.unit) : "not logged"}`}>
                <span className={`w-full max-w-5 rounded-t-md transition ${active ? "bg-slate-950" : hasValue ? config.color : "bg-slate-100"}`} style={{ height: hasValue ? `${height}%` : "3px" }} />
                <span className={`mt-2 block min-h-3 truncate text-[9px] font-bold ${active ? "text-slate-950" : "text-slate-400"}`}>
                  {showChartLabel(index, summary.dailyRows.length) ? day.label : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      </div>

      <div className={`mt-4 rounded-2xl p-4 ${config.soft}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-slate-900">{selectedDay ? formatDisplayDate(selectedDay.date) : "Selected day"}</p>
          <p className="text-sm font-black text-slate-900">{selectedHasValue ? formatMetric(selectedValue, config.unit) : "Not logged"}</p>
        </div>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
          {getChartInterpretation(average, target, config.label, config.unit, loggedValues.length)}
        </p>
      </div>
    </section>
  );
}

function ReferenceLine({ position, label, dashed = false }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ bottom: `${position}%` }}>
      <span className="absolute -top-4 right-0 bg-white pl-1 text-[9px] font-black text-slate-400">{label}</span>
      <div className={`border-t ${dashed ? "border-dashed border-slate-400" : "border-slate-300"}`} />
    </div>
  );
}

function OnTrackSection({ summary }) {
  const rows = [
    { label: "Calories near target", value: summary.daysNearCalorieTarget, total: summary.loggedDayCount, tone: "bg-emerald-600" },
    { label: "Protein target", value: summary.proteinTargetDays, total: summary.loggedDayCount, tone: "bg-indigo-600" },
    { label: "Hydration target", value: summary.hydratedDays, total: summary.totalDays, tone: "bg-cyan-600" },
    { label: "Logging consistency", value: summary.loggedDayCount, total: summary.totalDays, tone: "bg-slate-700" },
  ];
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">On track</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Progress across the selected period.</p>
        </div>
        {summary.streak > 0 && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">🔥 {summary.streak} day streak</span>}
      </div>
      <div className="mt-4 divide-y divide-slate-100">
        {rows.map((row) => <ProgressRow key={row.label} {...row} />)}
      </div>
    </section>
  );
}

function ProgressRow({ label, value, total, tone }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-bold text-slate-700">{label}</p>
        <p className="font-black text-slate-950">{value}/{total} days</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

function ComparisonSection({ summary, mode }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Compared with last {mode}</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">Equivalent days from the previous period.</p>
      {!summary.comparisons.hasPreviousData ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Not enough previous data for a useful comparison yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          <ComparisonRow label="Average calories" value={`${summary.averages.calories} kcal`} change={summary.comparisons.calories} unit="kcal" />
          <ComparisonRow label="Average protein" value={`${summary.averages.protein}g`} change={summary.comparisons.protein} unit="g" />
          <ComparisonRow label="Average water" value={formatWaterAmount(summary.averageWaterMl)} change={summary.comparisons.water} unit="ml" />
          <ComparisonRow label="Logged days" value={`${summary.loggedDayCount}`} change={summary.comparisons.loggedDays} unit="days" />
        </div>
      )}
    </section>
  );
}

function ComparisonRow({ label, value, change, unit }) {
  const direction = change > 0 ? "↑" : change < 0 ? "↓" : "—";
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <p className="text-sm font-bold text-slate-600">{label}</p>
      <div className="text-right"><p className="text-sm font-black text-slate-950">{value}</p><p className="mt-0.5 text-[11px] font-bold text-slate-400">{direction} {Math.abs(change)} {unit}</p></div>
    </div>
  );
}

function InsightSection({ insights }) {
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Patterns</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">What your recent logs suggest.</p>
      <div className="mt-4 space-y-3">
        {insights.map((insight) => (
          <div key={insight.title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
            <span className="text-xl" aria-hidden="true">{insight.icon}</span>
            <div><p className="text-sm font-black text-slate-900">{insight.title}</p><p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{insight.text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MealDistribution({ mealCalories }) {
  const total = Object.values(mealCalories).reduce((sum, value) => sum + value, 0);
  const colors = { Breakfast: "bg-amber-400", Lunch: "bg-emerald-500", "Evening Snack": "bg-sky-400", Dinner: "bg-indigo-500", Other: "bg-slate-400" };
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Calories by meal</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">Where your logged intake is distributed.</p>
      {total === 0 ? <p className="mt-4 text-sm text-slate-400">No meal data yet.</p> : (
        <>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {Object.entries(mealCalories).map(([meal, value]) => value > 0 && <span key={meal} className={colors[meal]} style={{ width: `${(value / total) * 100}%` }} />)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {Object.entries(mealCalories).filter(([, value]) => value > 0).map(([meal, value]) => (
              <div key={meal} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 font-bold text-slate-600"><span className={`h-2.5 w-2.5 shrink-0 rounded ${colors[meal]}`} />{meal}</span><span className="font-black text-slate-900">{Math.round((value / total) * 100)}%</span></div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FoodPatterns({ summary, mode, onModeChange }) {
  const foods = mode === "frequent" ? summary.mostLoggedFoods : summary.calorieImpactFoods;
  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Food patterns</h3>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        <SmallTab label="Frequent" active={mode === "frequent"} onClick={() => onModeChange("frequent")} />
        <SmallTab label="Calorie impact" active={mode === "impact"} onClick={() => onModeChange("impact")} />
      </div>
      <div className="mt-3 divide-y divide-slate-100">
        {foods.length ? foods.map((food, index) => <FoodRow key={food.foodId} food={food} index={index} />) : <p className="py-5 text-center text-sm text-slate-400">Log more foods to see patterns.</p>}
      </div>
    </section>
  );
}

function FoodRow({ food, index }) {
  return <div className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">#{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{food.name}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">{food.count} log{food.count === 1 ? "" : "s"}</p></div></div><p className="shrink-0 text-sm font-black text-slate-700">{Math.round(food.calories)} <span className="text-[10px] text-slate-400">kcal</span></p></div>;
}

function PeriodButton({ label, active, onClick }) {
  return <button type="button" onClick={onClick} className={`rounded-xl px-4 py-3 text-sm font-black transition ${active ? "bg-white text-slate-950 shadow-sm" : "text-slate-400"}`}>{label}</button>;
}

function SmallTab({ label, active, onClick }) {
  return <button type="button" onClick={onClick} className={`min-h-10 rounded-lg text-xs font-black ${active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>{label}</button>;
}

function getChartInterpretation(average, target, label, unit, loggedCount) {
  if (!loggedCount) return `Log ${label.toLowerCase()} to begin seeing a trend.`;
  const difference = Math.round(average - target);
  if (Math.abs(difference) <= target * 0.1) return `Your average is within 10% of the ${formatMetric(target, unit)} target.`;
  return `Your average is ${formatMetric(Math.abs(difference), unit)} ${difference > 0 ? "above" : "below"} the target.`;
}

function showChartLabel(index, count) {
  if (count <= 7) return true;
  return index === 0 || index === count - 1 || index % 5 === 4;
}

function formatMetric(value, unit) {
  if (unit === "ml" && value >= 1000) return `${Number((value / 1000).toFixed(1))} L`;
  return `${Number(value).toLocaleString("en-IN")} ${unit}`;
}

export default SummaryPage;
