"use client";

import { WeightEntry } from "@/types";

interface Props {
  entries: WeightEntry[];
  goalWeight: number | null;
  tdee: number;
}

export default function ProgressPanel({ entries, goalWeight, tdee }: Props) {
  if (entries.length === 0) return null;

  const current = entries[0].weight;
  // Start = oldest recorded entry
  const start = entries[entries.length - 1].weight;
  const totalLost = start - current;

  let progressPct: number | null = null;
  let toGoal: number | null = null;
  if (goalWeight != null) {
    toGoal = Math.max(current - goalWeight, 0);
    const totalToLose = start - goalWeight;
    if (totalToLose > 0) {
      progressPct = Math.min(100, Math.max(0, (totalLost / totalToLose) * 100));
    } else if (current <= goalWeight) {
      progressPct = 100;
    }
  }

  const reachedGoal = goalWeight != null && current <= goalWeight;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-500">Huidig</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{current.toFixed(1)} kg</p>
          <p className="text-xs text-gray-400">Laatste meting</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Afgevallen</p>
          <p className={`text-lg font-bold mt-0.5 ${totalLost > 0 ? "text-green-600" : totalLost < 0 ? "text-red-500" : "text-gray-900"}`}>
            {totalLost > 0 ? "−" : totalLost < 0 ? "+" : ""}
            {Math.abs(totalLost).toFixed(1)} kg
          </p>
          <p className="text-xs text-gray-400">Sinds start</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Dagdoel</p>
          <p className="text-lg font-bold text-gray-900 mt-0.5">{tdee} kcal</p>
          <p className="text-xs text-gray-400">Voor afvallen</p>
        </div>
      </div>

      {goalWeight != null && (
        <div className="border-t border-gray-100 pt-3">
          {reachedGoal ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-sm font-semibold text-green-700">Doel bereikt!</p>
                <p className="text-xs text-gray-500">{current.toFixed(1)} kg / doel {goalWeight} kg</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-baseline mb-1.5">
                <p className="text-sm font-medium text-gray-700">
                  Voortgang naar {goalWeight} kg
                </p>
                <p className="text-xs text-gray-500">
                  nog <span className="font-semibold text-gray-900">{toGoal?.toFixed(1)} kg</span>
                  {progressPct != null && (
                    <span className="text-gray-400"> · {progressPct.toFixed(0)}%</span>
                  )}
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct ?? 0}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {goalWeight == null && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            💡 Stel een doelgewicht in bij &ldquo;Lichaamsgegevens &amp; doel&rdquo; om je voortgang te zien.
          </p>
        </div>
      )}
    </div>
  );
}
