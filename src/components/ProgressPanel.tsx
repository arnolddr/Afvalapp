"use client";

import { WeightEntry } from "@/types";

interface Props {
  entries: WeightEntry[];
  goalWeight: number | null;
  tdee: number;
}

// Use local calendar date (YYYY-MM-DD) so timezone doesn't shift the day boundary.
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStreak(entries: WeightEntry[]): number {
  if (entries.length === 0) return 0;
  const dateSet = new Set(entries.map((e) => localDateStr(new Date(e.date))));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0); // midday local — safe from DST edge cases
  while (true) {
    if (!dateSet.has(localDateStr(cursor))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function weeklyAvg(entries: WeightEntry[], weeksAgo: number): number | null {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const slice = entries.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
  if (slice.length === 0) return null;
  return slice.reduce((s, e) => s + e.weight, 0) / slice.length;
}

function projectedGoalDate(
  entries: WeightEntry[],
  goalWeight: number
): Date | null {
  if (entries.length < 7) return null;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const days =
    (new Date(newest.date).getTime() - new Date(oldest.date).getTime()) /
    86400000;
  if (days < 1) return null;
  const ratePerDay = (oldest.weight - newest.weight) / days;
  if (ratePerDay <= 0) return null;
  const daysLeft = (newest.weight - goalWeight) / ratePerDay;
  if (daysLeft < 0) return null;
  const target = new Date(newest.date);
  target.setDate(target.getDate() + Math.ceil(daysLeft));
  return target;
}

export default function ProgressPanel({ entries, goalWeight, tdee }: Props) {
  if (entries.length === 0) return null;

  const current = entries[0].weight;
  const start = entries[entries.length - 1].weight;
  const totalLost = start - current;
  const streak = calcStreak(entries);

  const thisWeekAvg = weeklyAvg(entries, 0);
  const lastWeekAvg = weeklyAvg(entries, 1);
  const weekDiff =
    thisWeekAvg != null && lastWeekAvg != null
      ? thisWeekAvg - lastWeekAvg
      : null;

  let progressPct: number | null = null;
  let toGoal: number | null = null;
  let goalDate: Date | null = null;

  if (goalWeight != null) {
    toGoal = Math.max(current - goalWeight, 0);
    const totalToLose = start - goalWeight;
    if (totalToLose > 0) {
      progressPct = Math.min(100, Math.max(0, (totalLost / totalToLose) * 100));
    } else if (current <= goalWeight) {
      progressPct = 100;
    }
    goalDate = projectedGoalDate(entries, goalWeight);
  }

  const reachedGoal = goalWeight != null && current <= goalWeight;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const totalDays =
    entries.length > 1
      ? Math.max(
          1,
          (new Date(newest.date).getTime() - new Date(oldest.date).getTime()) /
            86400000
        )
      : 1;
  const ratePerWeek =
    entries.length >= 2 ? ((oldest.weight - newest.weight) / totalDays) * 7 : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Top stat grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Huidig gewicht</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">
            {current.toFixed(1)} kg
          </p>
          <p className="text-xs text-gray-400">Laatste meting</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Afgevallen</p>
          <p
            className={`text-lg font-bold mt-0.5 ${
              totalLost > 0
                ? "text-green-600"
                : totalLost < 0
                ? "text-red-500"
                : "text-gray-900"
            }`}
          >
            {totalLost > 0 ? "−" : totalLost < 0 ? "+" : ""}
            {Math.abs(totalLost).toFixed(1)} kg
          </p>
          <p className="text-xs text-gray-400">Totaal</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Dagdoel</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{tdee} kcal</p>
          <p className="text-xs text-gray-400">Voor afvallen</p>
        </div>
      </div>

      {/* Streak + tempo row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xs text-orange-600 font-medium">Streak</p>
            <p className="text-lg font-bold text-orange-700">
              {streak} {streak === 1 ? "dag" : "dagen"}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">📉</span>
          <div>
            <p className="text-xs text-blue-600 font-medium">Tempo</p>
            <p className="text-lg font-bold text-blue-700">
              {ratePerWeek > 0
                ? `−${ratePerWeek.toFixed(2)} kg/w`
                : ratePerWeek < 0
                ? `+${Math.abs(ratePerWeek).toFixed(2)} kg/w`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly comparison */}
      {(thisWeekAvg != null || lastWeekAvg != null) && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Weekvergelijking (gem. gewicht)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-gray-500">Vorige week</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {lastWeekAvg != null ? `${lastWeekAvg.toFixed(1)} kg` : "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-gray-500">Deze week</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {thisWeekAvg != null ? `${thisWeekAvg.toFixed(1)} kg` : "—"}
              </p>
            </div>
          </div>
          {weekDiff != null && (
            <p
              className={`text-xs mt-2 font-medium ${
                weekDiff < 0 ? "text-green-600" : weekDiff > 0 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {weekDiff < 0
                ? `📉 ${Math.abs(weekDiff).toFixed(2)} kg afgevallen t.o.v. vorige week`
                : weekDiff > 0
                ? `📈 ${weekDiff.toFixed(2)} kg aangekomen t.o.v. vorige week`
                : "Gelijk aan vorige week"}
            </p>
          )}
        </div>
      )}

      {/* Goal progress */}
      {goalWeight != null && (
        <div className="border-t border-gray-100 pt-3">
          {reachedGoal ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Doel bereikt!
                </p>
                <p className="text-xs text-gray-500">
                  {current.toFixed(1)} kg / doel {goalWeight} kg
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-baseline mb-1.5">
                <p className="text-sm font-medium text-gray-700">
                  Voortgang naar {goalWeight} kg
                </p>
                <p className="text-xs text-gray-500">
                  nog{" "}
                  <span className="font-semibold text-gray-900">
                    {toGoal?.toFixed(1)} kg
                  </span>
                  {progressPct != null && (
                    <span className="text-gray-400">
                      {" "}· {progressPct.toFixed(0)}%
                    </span>
                  )}
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct ?? 0}%` }}
                />
              </div>
              {goalDate != null && (
                <p className="text-xs text-gray-500 mt-2">
                  🎯 Op dit tempo bereik je je doel op{" "}
                  <span className="font-semibold text-gray-900">
                    {goalDate.toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
              {goalDate == null && entries.length < 7 && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 Na 7 metingen verschijnt hier je verwachte doeldatum.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {goalWeight == null && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            💡 Stel een doelgewicht in bij &ldquo;Lichaamsgegevens &amp;
            doel&rdquo; om je voortgang te zien.
          </p>
        </div>
      )}
    </div>
  );
}
