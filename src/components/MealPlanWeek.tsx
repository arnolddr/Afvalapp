"use client";

import { useEffect, useState } from "react";
import { MealData, MealPlan } from "@/types";
import RecipeModal from "./RecipeModal";

interface Props {
  plan: MealPlan;
  activeProfile: string;
}

const DAY_ORDER = [
  "Zaterdag",
  "Zondag",
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
];

function useEatenMeals(planId: number) {
  const key = `eaten-${planId}`;
  const [eaten, setEaten] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setEaten(JSON.parse(saved));
  }, [key]);

  function toggle(dayIndex: number, type: string) {
    setEaten((prev) => {
      const k = `${dayIndex}-${type}`;
      const next = { ...prev, [k]: !prev[k] };
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }

  function isEaten(dayIndex: number, type: string) {
    return !!eaten[`${dayIndex}-${type}`];
  }

  return { eaten, toggle, isEaten };
}

export default function MealPlanWeek({ plan, activeProfile }: Props) {
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const { toggle, isEaten, eaten } = useEatenMeals(plan.id);

  const mealsByDay = DAY_ORDER.map((day, dayIndex) => ({
    day,
    dayIndex,
    lunch: plan.meals.find((m) => m.dayIndex === dayIndex && m.type === "lunch"),
    dinner: plan.meals.find((m) => m.dayIndex === dayIndex && m.type === "dinner"),
  }));

  const weekStartDate = new Date(plan.weekStart);
  const weekEndDate = new Date(plan.weekEnd);

  const profileNames = plan.allTargets ? Object.keys(plan.allTargets) : [];
  const showBothProfiles = profileNames.length > 1;

  const eatenCount = Object.values(eaten).filter(Boolean).length;
  const totalMeals = plan.meals.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Weekmenu</h2>
          <p className="text-sm text-gray-500">
            {weekStartDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
            {" – "}
            {weekEndDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          {showBothProfiles ? (
            <div className="space-y-0.5">
              {profileNames.map((name) => (
                <p key={name} className="text-sm font-medium text-gray-900">
                  {name}: {plan.allTargets![name]} kcal/dag
                </p>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">
                {plan.targetCalories} kcal/dag
              </p>
              <p className="text-xs text-gray-500">Per persoon</p>
            </>
          )}
        </div>
      </div>

      {/* Eaten progress bar */}
      {eatenCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{eatenCount}/{totalMeals} maaltijden gegeten</span>
            <span className="text-xs font-medium text-green-600">{Math.round((eatenCount / totalMeals) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(eatenCount / totalMeals) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {mealsByDay.map(({ day, dayIndex, lunch, dinner }) => (
          <div
            key={dayIndex}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">{day}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { meal: lunch, label: "Lunch", icon: "☀️" },
                { meal: dinner, label: "Diner", icon: "🌙" },
              ].map(({ meal, label, icon }) =>
                meal ? (
                  <div key={label} className="flex items-stretch">
                    {/* Check-off button */}
                    <button
                      onClick={() => toggle(meal.dayIndex, meal.type)}
                      className={`flex-shrink-0 w-10 flex items-center justify-center border-r border-gray-50 transition-colors ${
                        isEaten(meal.dayIndex, meal.type)
                          ? "bg-green-50 text-green-500"
                          : "text-gray-200 hover:text-gray-400"
                      }`}
                      title={isEaten(meal.dayIndex, meal.type) ? "Aangevinkt" : "Vink af als gegeten"}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>

                    {/* Meal details */}
                    <button
                      onClick={() => setSelectedMeal(meal)}
                      className={`flex-1 text-left px-4 py-3 hover:bg-green-50 transition-colors group min-w-0 ${
                        isEaten(meal.dayIndex, meal.type) ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs">{icon}</span>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {label}
                            </span>
                          </div>
                          <p className={`text-sm font-medium truncate group-hover:text-green-700 ${
                            isEaten(meal.dayIndex, meal.type) ? "line-through text-gray-400" : "text-gray-900"
                          }`}>
                            {meal.name}
                          </p>
                          {showBothProfiles && meal.allCalories ? (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {profileNames.map((n) => `${n}: ${meal.allCalories![n] ?? "–"} kcal`).join(" · ")}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 truncate">{meal.description}</p>
                          )}
                        </div>
                        <div className="ml-3 text-right flex-shrink-0">
                          <p className="text-sm font-medium text-orange-600">
                            {(meal.allCalories?.[activeProfile] ?? meal.calories)} kcal
                          </p>
                          <p className="text-xs text-gray-400">
                            E: {meal.protein}g · K: {meal.carbs}g · V: {meal.fat}g
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div key={label} className="px-4 py-3 text-sm text-gray-400">
                    {icon} {label} — niet beschikbaar
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
    </div>
  );
}
