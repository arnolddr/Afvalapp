"use client";

import { useState } from "react";
import { WeightEntry } from "@/types";

interface Props {
  entries: WeightEntry[];
  profile: string;
  onDelete: (id: number) => void;
}

export default function WeightHistory({ entries, profile, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/weight/${id}`, { method: "DELETE" });
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
            className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 group"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
