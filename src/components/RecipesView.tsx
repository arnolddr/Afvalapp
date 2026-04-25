"use client";

import { useState, useEffect } from "react";
import { MealData, MealPlan } from "@/types";
import RecipeModal from "./RecipeModal";
import { LUNCH_RECIPES, DINNER_RECIPES, Recipe } from "@/lib/mealPlanGenerator";

interface Props {
  plan: MealPlan | null;
  activeProfile: string;
  disliked: Set<string>;
  onToggleDislike: (name: string) => void;
}

const DAY_ORDER = ["Zaterdag", "Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

function staticToMealData(r: Recipe, type: "lunch" | "dinner"): MealData {
  return {
    id: 0, day: "", dayIndex: 0, type,
    name: r.name, description: r.description,
    calories: r.baseCalories, baseCalories: r.baseCalories,
    protein: r.protein, carbs: r.carbs, fat: r.fat,
    ingredients: r.ingredients, instructions: r.instructions,
  };
}

type ViewTab = "week" | "alle";

export default function RecipesView({ plan, activeProfile, disliked, onToggleDislike }: Props) {
  const [viewTab, setViewTab] = useState<ViewTab>(plan ? "week" : "alle");
  const [typeFilter, setTypeFilter] = useState<"alles" | "lunch" | "diner">("alles");
  const [selected, setSelected] = useState<MealData | null>(null);

  // Switch to "week" tab when a plan becomes available
  useEffect(() => {
    if (plan) setViewTab("week");
  }, [plan?.id]);

  // --- Week tab: meals from the actual plan ---
  const planMealsByDay = DAY_ORDER.map((day, idx) => ({
    day,
    lunch: plan?.meals.find((m) => m.dayIndex === idx && m.type === "lunch") ?? null,
    dinner: plan?.meals.find((m) => m.dayIndex === idx && m.type === "dinner") ?? null,
  }));

  // --- Alle recepten tab: static library ---
  const allStatic: MealData[] = [
    ...LUNCH_RECIPES.map((r) => staticToMealData(r, "lunch")),
    ...DINNER_RECIPES.map((r) => staticToMealData(r, "dinner")),
  ];
  const visibleStatic = allStatic.filter(
    (r) =>
      typeFilter === "alles" ||
      (typeFilter === "lunch" && r.type === "lunch") ||
      (typeFilter === "diner" && r.type === "dinner")
  );

  function MealRow({ meal }: { meal: MealData }) {
    const bad = disliked.has(meal.name);
    const kcal = meal.allCalories?.[activeProfile] ?? meal.calories;
    return (
      <div className={`flex items-stretch ${bad ? "opacity-60" : ""}`}>
        <button
          onClick={() => setSelected(meal)}
          className="flex-1 text-left px-4 py-3 hover:bg-green-50 transition-colors group min-w-0"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 truncate">
                {meal.name}
              </p>
              {bad && (
                <span className="text-xs text-red-500 font-medium">👎 Niet lekker</span>
              )}
            </div>
            <p className="text-sm font-medium text-orange-600 flex-shrink-0">{kcal} kcal</p>
          </div>
        </button>
        <button
          onClick={() => onToggleDislike(meal.name)}
          title={bad ? "Verwijder 'niet lekker'" : "Markeer als niet lekker"}
          className={`flex-shrink-0 w-10 flex items-center justify-center border-l border-gray-50 text-lg transition-colors ${
            bad ? "text-red-400 bg-red-50" : "text-gray-200 hover:text-red-400"
          }`}
        >
          👎
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top tab bar */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        {plan && (
          <button
            onClick={() => setViewTab("week")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              viewTab === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Deze week
          </button>
        )}
        <button
          onClick={() => setViewTab("alle")}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            viewTab === "alle" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Alle recepten
        </button>
      </div>

      {/* WEEK TAB */}
      {viewTab === "week" && plan && (
        <div className="space-y-3">
          {planMealsByDay.map(({ day, lunch, dinner }) => (
            <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">{day}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {lunch ? (
                  <MealRow meal={lunch} />
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-400">☀️ Lunch — niet beschikbaar</p>
                )}
                {dinner ? (
                  <MealRow meal={dinner} />
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-400">🌙 Diner — niet beschikbaar</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALLE RECEPTEN TAB */}
      {viewTab === "alle" && (
        <>
          <div className="flex gap-2 mb-3">
            {(["alles", "lunch", "diner"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  typeFilter === f
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === "alles" ? "Alles" : f === "lunch" ? "☀️ Lunch" : "🌙 Diner"}
              </button>
            ))}
            {disliked.size > 0 && (
              <span className="ml-auto text-xs text-red-500 self-center">
                {disliked.size} niet lekker
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {visibleStatic.map((meal) => (
              <MealRow key={meal.name} meal={meal} />
            ))}
          </div>
        </>
      )}

      <RecipeModal
        meal={selected}
        onClose={() => setSelected(null)}
        isDisliked={selected ? disliked.has(selected.name) : false}
        onToggleDislike={onToggleDislike}
      />
    </div>
  );
}
