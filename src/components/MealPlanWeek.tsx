"use client";

import { useState } from "react";
import { MealData, MealPlan } from "@/types";
import RecipeModal from "./RecipeModal";

interface Props {
  plan: MealPlan;
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

export default function MealPlanWeek({ plan }: Props) {
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);

  const mealsByDay = DAY_ORDER.map((day, dayIndex) => ({
    day,
    dayIndex,
    lunch: plan.meals.find((m) => m.dayIndex === dayIndex && m.type === "lunch"),
    dinner: plan.meals.find((m) => m.dayIndex === dayIndex && m.type === "dinner"),
  }));

  const weekStartDate = new Date(plan.weekStart);
  const weekEndDate = new Date(plan.weekEnd);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Weekmenu
          </h2>
          <p className="text-sm text-gray-500">
            {weekStartDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
            {" – "}
            {weekEndDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {plan.targetCalories} kcal/dag
          </p>
          <p className="text-xs text-gray-500">Doelstelling</p>
        </div>
      </div>

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
                  <button
                    key={label}
                    onClick={() => setSelectedMeal(meal)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs">{icon}</span>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-700">
                          {meal.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{meal.description}</p>
                      </div>
                      <div className="ml-3 text-right flex-shrink-0">
                        <p className="text-sm font-medium text-orange-600">
                          {meal.calories} kcal
                        </p>
                        <p className="text-xs text-gray-400">
                          E: {meal.protein}g · K: {meal.carbs}g · V: {meal.fat}g
                        </p>
                      </div>
                    </div>
                  </button>
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
