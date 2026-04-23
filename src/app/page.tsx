"use client";

import { useEffect, useState } from "react";
import WeightInput from "@/components/WeightInput";
import WeightHistory from "@/components/WeightHistory";
import GeneratePlanButton from "@/components/GeneratePlanButton";
import MealPlanWeek from "@/components/MealPlanWeek";
import { MealPlan, WeightEntry } from "@/types";
import { calculateWeightLossCalories } from "@/lib/calories";
import InstallBanner from "@/components/InstallBanner";

export default function Home() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const latestWeight = weights[0]?.weight ?? null;

  useEffect(() => {
    async function loadData() {
      try {
        const [wRes, mpRes] = await Promise.all([
          fetch("/api/weight"),
          fetch("/api/meal-plan"),
        ]);
        const [w, mp] = await Promise.all([wRes.json(), mpRes.json()]);
        setWeights(w);
        setMealPlans(mp);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  function handleWeightSaved(weight: number) {
    const newEntry: WeightEntry = {
      id: Date.now(),
      weight,
      unit: "kg",
      date: new Date().toISOString(),
    };
    setWeights((prev) => [newEntry, ...prev]);
  }

  function handlePlanGenerated(plan: MealPlan) {
    setMealPlans((prev) => [plan, ...prev]);
    setSelectedPlanIdx(0);
  }

  const currentPlan = mealPlans[selectedPlanIdx];
  const tdee = latestWeight ? calculateWeightLossCalories(latestWeight) : null;

  const isThursday = new Date().getDay() === 4;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-lg">
              🥦
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AfvalApp</h1>
              <p className="text-xs text-gray-500">Persoonlijk weekmenu</p>
            </div>
          </div>
          {isThursday && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Vandaag is het donderdag – tijd voor een nieuw menu!
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Stats bar */}
        {latestWeight && tdee && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Huidig gewicht",
                value: `${latestWeight.toFixed(1)} kg`,
                sub: "Laatste meting",
              },
              {
                label: "Dagdoel",
                value: `${tdee} kcal`,
                sub: "Calorieën voor verlies",
              },
              {
                label: "Verwacht verlies",
                value: "~0.5 kg",
                sub: "Per week",
              },
            ].map(({ label, value, sub }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Weight section */}
        <div className="grid gap-4 md:grid-cols-2">
          <WeightInput onWeightSaved={handleWeightSaved} />
          <WeightHistory entries={weights} />
        </div>

        {/* Generate plan */}
        <GeneratePlanButton
          latestWeight={latestWeight}
          onPlanGenerated={handlePlanGenerated}
        />

        {/* Meal plan display */}
        {loadingData ? (
          <div className="text-center py-12 text-gray-400">Laden...</div>
        ) : mealPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-600 font-medium">Nog geen weekmenu</p>
            <p className="text-gray-400 text-sm mt-1">
              Voer je gewicht in en klik op &ldquo;Weekmenu genereren&rdquo; om
              je eerste menu aan te maken.
            </p>
          </div>
        ) : (
          <div>
            {/* Plan selector when multiple exist */}
            {mealPlans.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {mealPlans.map((plan, idx) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanIdx(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      idx === selectedPlanIdx
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {new Date(plan.weekStart).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                    {" – "}
                    {new Date(plan.weekEnd).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </button>
                ))}
              </div>
            )}
            {currentPlan && <MealPlanWeek plan={currentPlan} />}
          </div>
        )}
      </main>
      <InstallBanner />
    </div>
  );
}
