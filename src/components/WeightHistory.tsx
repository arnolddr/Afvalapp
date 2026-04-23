"use client";

import { WeightEntry } from "@/types";

interface Props {
  entries: WeightEntry[];
}

export default function WeightHistory({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Gewichtsverloop
        </h2>
        <p className="text-gray-500 text-sm">
          Nog geen gewichten ingevoerd.
        </p>
      </div>
    );
  }

  const latest = entries[0];
  const previous = entries[1];
  const diff = previous ? latest.weight - previous.weight : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Gewichtsverloop
      </h2>

      <div className="flex items-end gap-4 mb-4">
        <div>
          <p className="text-4xl font-bold text-gray-900">
            {latest.weight.toFixed(1)}
            <span className="text-xl text-gray-500 ml-1">kg</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">Huidig gewicht</p>
        </div>
        {diff !== null && (
          <div className={`mb-1 ${diff < 0 ? "text-green-600" : "text-red-500"}`}>
            <span className="text-lg font-semibold">
              {diff > 0 ? "+" : ""}
              {diff.toFixed(1)} kg
            </span>
            <p className="text-xs">t.o.v. vorige meting</p>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0"
          >
            <span className="text-sm text-gray-600">
              {new Date(entry.date).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {entry.weight.toFixed(1)} kg
              </span>
              {idx < entries.length - 1 && (
                <span
                  className={`text-xs font-medium ${
                    entry.weight < entries[idx + 1].weight
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {entry.weight < entries[idx + 1].weight ? "▼" : "▲"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
