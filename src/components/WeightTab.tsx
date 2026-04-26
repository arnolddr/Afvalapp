"use client";

import { WeightEntry } from "@/types";

interface Props {
  entries: WeightEntry[];  // newest-first
  goalWeight: number | null;
  profile: string;
}

interface WeekRow {
  label: string;
  endWeight: number;
  change: number | null; // vs previous week's end weight
}

function getWeekRows(entries: WeightEntry[]): WeekRow[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].reverse(); // oldest first

  const byWeek = new Map<string, WeightEntry[]>();
  for (const e of sorted) {
    const d = new Date(e.date);
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = mon.toISOString().slice(0, 10);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(e);
  }

  const weeks = Array.from(byWeek.entries()).sort(([a], [b]) => a.localeCompare(b));
  const rows: WeekRow[] = [];

  for (let i = 0; i < weeks.length; i++) {
    const [key, weekEntries] = weeks[i];
    const end = weekEntries[weekEntries.length - 1].weight;
    const prevEnd = i > 0 ? weeks[i - 1][1][weeks[i - 1][1].length - 1].weight : null;
    const monDate = new Date(key);
    rows.push({
      label: monDate.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      endWeight: end,
      change: prevEnd !== null ? end - prevEnd : null,
    });
  }

  return rows.reverse(); // newest first for display
}

function WeightChart({
  entries,
  goalWeight,
}: {
  entries: WeightEntry[];
  goalWeight: number | null;
}) {
  if (entries.length < 2) return null;
  const points = [...entries].reverse();
  const weights = points.map((e) => e.weight);
  const min = Math.min(...weights, goalWeight ?? Infinity);
  const max = Math.max(...weights, goalWeight ?? -Infinity);
  const pad = Math.max((max - min) * 0.12, 0.5);
  const yMin = min - pad;
  const yMax = max + pad;
  const range = yMax - yMin || 1;
  const W = 320;
  const H = 120;
  const xStep = points.length > 1 ? W / (points.length - 1) : W;
  const coords = points.map((p, i) => ({
    x: i * xStep,
    y: H - ((p.weight - yMin) / range) * H,
  }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const goalY = goalWeight != null ? H - ((goalWeight - yMin) / range) * H : null;
  const trend = points[points.length - 1].weight - points[0].weight;
  const lineColor = trend < 0 ? "#16a34a" : trend > 0 ? "#ef4444" : "#9ca3af";

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28" preserveAspectRatio="none">
        {goalY != null && (
          <line x1="0" x2={W} y1={goalY} y2={goalY}
            strokeDasharray="5,4" stroke="#16a34a" strokeWidth="1.5" opacity="0.6" />
        )}
        <path d={path} fill="none" stroke={lineColor} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {coords.length <= 30 && coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="white"
            stroke={lineColor} strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{new Date(points[0].date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
        {goalWeight != null && <span className="text-green-600 font-medium">doel {goalWeight} kg</span>}
        <span>{new Date(points[points.length - 1].date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function WeightTab({ entries, goalWeight, profile }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-4xl mb-3">⚖️</p>
        <p className="text-gray-600 font-medium">Nog geen gewichten voor {profile}</p>
        <p className="text-gray-400 text-sm mt-1">Voer je gewicht in op het dashboard.</p>
      </div>
    );
  }

  const current = entries[0].weight;
  const oldest = entries[entries.length - 1];
  const totalLost = oldest.weight - current;

  const firstDate = new Date(oldest.date);
  const lastDate = new Date(entries[0].date);
  const daysBetween = Math.max(1,
    (lastDate.getTime() - firstDate.getTime()) / 86400000
  );
  const weeks = daysBetween / 7;
  const months = daysBetween / 30.44;
  const quarters = daysBetween / 91.31;

  const fmt = (n: number) => {
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(1)} kg`;
  };

  const weekRows = getWeekRows(entries);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Gewichtsanalyse{profile !== "Ik" ? ` · ${profile}` : ""}
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Stat
            label="Totaal verloren"
            value={fmt(-totalLost)}
            sub={`${oldest.weight.toFixed(1)} → ${current.toFixed(1)} kg`}
          />
          {weeks >= 0.5 ? (
            <Stat
              label="Gemiddeld per week"
              value={fmt(-totalLost / weeks)}
              sub={`over ${weeks.toFixed(1)} weken`}
            />
          ) : (
            <Stat label="Gemiddeld per week" value="—" sub="te weinig data" />
          )}
          {months >= 0.5 ? (
            <Stat
              label="Gemiddeld per maand"
              value={fmt(-totalLost / months)}
              sub={`over ${months.toFixed(1)} maanden`}
            />
          ) : (
            <Stat label="Gemiddeld per maand" value="—" sub="te weinig data" />
          )}
          {quarters >= 0.5 ? (
            <Stat
              label="Gemiddeld per kwartaal"
              value={fmt(-totalLost / quarters)}
              sub={`over ${quarters.toFixed(1)} kwartalen`}
            />
          ) : (
            <Stat label="Gemiddeld per kwartaal" value="—" sub="te weinig data" />
          )}
        </div>

        {goalWeight != null && current > goalWeight && (
          <div className="bg-green-50 rounded-xl px-3 py-2 text-sm text-green-700">
            <span className="font-medium">{(current - goalWeight).toFixed(1)} kg</span>
            {" "}te gaan naar je doel van {goalWeight} kg
            {weeks >= 0.5 && Math.abs(totalLost / weeks) > 0.01 && (
              <span className="text-green-600">
                {" "}· nog ca.{" "}
                <span className="font-medium">
                  {Math.ceil((current - goalWeight) / Math.abs(totalLost / weeks))} weken
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Full chart */}
      {entries.length >= 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Grafiek</h3>
          <WeightChart entries={entries} goalWeight={goalWeight} />
        </div>
      )}

      {/* Weekly breakdown */}
      {weekRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Per week</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {weekRows.map((row, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-gray-600">
                  Week {row.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {row.endWeight.toFixed(1)} kg
                  </span>
                  {row.change !== null ? (
                    <span
                      className={`text-xs font-semibold w-16 text-right ${
                        row.change < 0
                          ? "text-green-600"
                          : row.change > 0
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {row.change > 0 ? "+" : ""}{row.change.toFixed(1)} kg
                      {row.change < 0 ? " ↓" : row.change > 0 ? " ↑" : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 w-16 text-right">eerste week</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
