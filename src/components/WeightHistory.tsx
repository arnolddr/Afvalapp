"use client";

import { useState } from "react";
import { WeightEntry } from "@/types";
import { fetchQueued } from "@/lib/offlineStore";

interface Props {
  entries: WeightEntry[];
  profile: string;
  goalWeight: number | null;
  onDelete: (id: number) => void;
  canEdit: boolean;
}

// Exponential moving average — alpha=0.1 (vergelijkbaar met Happy Scale smoothing)
function calcEMA(weights: number[], alpha = 0.1): number[] {
  if (weights.length === 0) return [];
  const ema = [weights[0]];
  for (let i = 1; i < weights.length; i++) {
    ema.push(alpha * weights[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
}

function WeightChart({
  entries,
  goalWeight,
}: {
  entries: WeightEntry[];
  goalWeight: number | null;
}) {
  if (entries.length < 2) return null;

  const points = [...entries].reverse(); // oldest → newest
  const rawWeights = points.map((p) => p.weight);
  const emaWeights = calcEMA(rawWeights);

  const allValues = [...rawWeights, ...emaWeights, goalWeight ?? Infinity].filter(isFinite);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const pad = Math.max((max - min) * 0.12, 0.5);
  const yMin = min - pad;
  const yMax = max + pad;
  const range = yMax - yMin || 1;

  const W = 300;
  const H = 90;
  const xStep = points.length > 1 ? W / (points.length - 1) : W;
  const toY = (v: number) => H - ((v - yMin) / range) * H;

  const rawCoords = points.map((_, i) => ({ x: i * xStep, y: toY(rawWeights[i]) }));
  const emaCoords = emaWeights.map((w, i) => ({ x: i * xStep, y: toY(w) }));

  const rawPath = rawCoords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const emaPath = emaCoords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

  const goalY = goalWeight != null ? toY(goalWeight) : null;
  const emaTrend = emaWeights[emaWeights.length - 1] - emaWeights[0];
  const emaColor = emaTrend < -0.05 ? "#16a34a" : emaTrend > 0.05 ? "#ef4444" : "#9ca3af";

  return (
    <div className="mb-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
        {goalY != null && (
          <line x1="0" x2={W} y1={goalY} y2={goalY}
            strokeDasharray="4,4" stroke="#16a34a" strokeWidth="1" opacity="0.5" />
        )}
        {/* Ruwe data — dun grijs */}
        <path d={rawPath} fill="none" stroke="#d1d5db" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* EMA trendlijn — dik gekleurd */}
        <path d={emaPath} fill="none" stroke={emaColor} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {rawCoords.length <= 30 && rawCoords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="2" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{new Date(points[0].date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
        {goalWeight != null && <span className="text-green-600 text-center">- - doel {goalWeight} kg</span>}
        <span>{new Date(points[points.length - 1].date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}

export default function WeightHistory({ entries, profile, goalWeight, onDelete, canEdit }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetchQueued(`/api/weight/${id}`, "DELETE");
      onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Gewichtsverloop {profile !== "Ik" ? `· ${profile}` : ""}
        </h2>
        <p className="text-gray-500 text-sm">Nog geen gewichten ingevoerd.</p>
      </div>
    );
  }

  const latest = entries[0];
  const previous = entries[1];
  const diff = previous ? latest.weight - previous.weight : null;

  // Down-for-day: vergelijk laatste meting met EMA-trendwaarde
  const sorted = [...entries].reverse();
  const emaValues = calcEMA(sorted.map((e) => e.weight));
  const latestEMA = emaValues[emaValues.length - 1];
  const downForDay = entries.length >= 3 ? latest.weight < latestEMA : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Gewichtsverloop</h2>

      {/* Huidig gewicht + diff */}
      <div className="flex items-end gap-4 mb-2">
        <div>
          <p className="text-4xl font-bold text-gray-900">
            {latest.weight.toFixed(1)}
            <span className="text-xl text-gray-500 ml-1">kg</span>
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Huidig gewicht</p>
        </div>
        {diff !== null && (
          <div className={`mb-1 ${diff < 0 ? "text-green-600" : "text-red-500"}`}>
            <span className="text-lg font-semibold">
              {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
            </span>
            <p className="text-xs">t.o.v. vorige meting</p>
          </div>
        )}
      </div>

      {/* Down-for-day indicator */}
      {downForDay !== null && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
          downForDay ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
        }`}>
          <span>{downForDay ? "↓" : "↑"}</span>
          <span>
            {downForDay
              ? `Onder trend · trend: ${latestEMA.toFixed(1)} kg`
              : `Boven trend · trend: ${latestEMA.toFixed(1)} kg`}
          </span>
        </div>
      )}

      <WeightChart entries={entries} goalWeight={goalWeight} />

      {/* Lijst van metingen */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="group border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-sm text-gray-600">
                {new Date(entry.date).toLocaleDateString("nl-NL", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {entry.weight.toFixed(1)} kg
                </span>
                {idx < entries.length - 1 && (
                  <span className={`text-xs font-medium ${
                    entry.weight < entries[idx + 1].weight ? "text-green-600" : "text-red-500"
                  }`}>
                    {entry.weight < entries[idx + 1].weight ? "▼" : "▲"}
                  </span>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all disabled:opacity-40 ml-1"
                    title="Verwijder meting"
                  >
                    {deletingId === entry.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            {entry.notes && (
              <p className="text-xs text-gray-400 italic pb-1">{entry.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
