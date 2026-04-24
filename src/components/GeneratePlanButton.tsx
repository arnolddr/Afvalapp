"use client";

import { useState } from "react";
import { MealPlan } from "@/types";

interface Props {
  latestWeight: number | null;
  profile: string;
  onPlanGenerated: (plan: MealPlan) => void;
}

export default function GeneratePlanButton({
  latestWeight,
  profile,
  onPlanGenerated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customWeight, setCustomWeight] = useState("");

  const isThursday = new Date().getDay() === 4;
  const weightToUse = customWeight
    ? parseFloat(customWeight)
    : latestWeight;

  async function handleGenerate() {
    if (!weightToUse || weightToUse < 20 || weightToUse > 500) {
      setError("Voer eerst een geldig gewicht in.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: weightToUse, profile }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Genereren mislukt");
      }
      const plan: MealPlan = await res.json();
      onPlanGenerated(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Weekmenu genereren</h2>
          <p className="text-green-100 text-sm mt-1">
            Elke donderdag staat er een nieuw menu klaar voor zaterdag t/m vrijdag
          </p>
        </div>
        <span className="text-3xl">🥗</span>
      </div>

      {!latestWeight && (
        <div className="mb-3">
          <label className="text-sm text-green-100 mb-1 block">
            Gewicht (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="500"
            value={customWeight}
            onChange={(e) => setCustomWeight(e.target.value)}
            placeholder="Bijv. 85.4"
            className="w-full px-3 py-2 rounded-xl bg-white/20 placeholder-green-200 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      )}

      {latestWeight && (
        <div className="mb-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
          <span className="text-green-200 text-sm">Gewicht:</span>
          <span className="font-semibold">{latestWeight} kg</span>
        </div>
      )}

      {!isThursday && (
        <p className="text-xs text-green-200 mb-3">
          Het menu wordt normaal elke donderdag gegenereerd. Je kunt ook nu
          alvast een menu aanmaken.
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 disabled:opacity-60 transition-colors"
      >
        {loading
          ? "Menu samenstellen..."
          : isThursday
          ? "Weekmenu voor komende week genereren"
          : "Nieuw weekmenu aanmaken"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-200">{error}</p>
      )}
    </div>
  );
}
