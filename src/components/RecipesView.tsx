"use client";

import { useState } from "react";
import { MealData } from "@/types";
import RecipeModal from "./RecipeModal";
import { LUNCH_RECIPES, DINNER_RECIPES, Recipe } from "@/lib/mealPlanGenerator";

type Filter = "alles" | "lunch" | "diner";

function toMealData(r: Recipe, type: "lunch" | "dinner"): MealData {
  return {
    id: 0, day: "", dayIndex: 0,
    type,
    name: r.name,
    description: r.description,
    calories: r.baseCalories,
    baseCalories: r.baseCalories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    ingredients: r.ingredients,
    instructions: r.instructions,
  };
}

export default function RecipesView() {
  const [filter, setFilter] = useState<Filter>("alles");
  const [selected, setSelected] = useState<MealData | null>(null);

  const all = [
    ...LUNCH_RECIPES.map((r) => toMealData(r, "lunch")),
    ...DINNER_RECIPES.map((r) => toMealData(r, "dinner")),
  ];
  const visible = all.filter(
    (r) =>
      filter === "alles" ||
      (filter === "lunch" && r.type === "lunch") ||
      (filter === "diner" && r.type === "dinner")
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["alles", "lunch", "diner"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "alles" ? "Alles" : f === "lunch" ? "☀️ Lunch" : "🌙 Diner"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {visible.length} recepten
        </span>
      </div>

      <div className="grid gap-3">
        {visible.map((meal, i) => (
          <button
            key={i}
            onClick={() => setSelected(meal)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:bg-green-50 hover:border-green-200 transition-colors group"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{meal.type === "lunch" ? "☀️" : "🌙"}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {meal.type === "lunch" ? "Lunch" : "Diner"}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700 truncate">
                  {meal.name}
                </p>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {meal.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-orange-600">
                  {meal.calories} kcal
                </p>
                <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                  <span>E {meal.protein}g</span>
                  <span>K {meal.carbs}g</span>
                  <span>V {meal.fat}g</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <RecipeModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
