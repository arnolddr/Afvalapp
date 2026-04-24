"use client";

import { MealData } from "@/types";
import { useEffect, useState } from "react";
import { scaleIngredients } from "@/lib/ingredients";

interface Props {
  meal: MealData | null;
  onClose: () => void;
  defaultServings?: number;
}

export default function RecipeModal({ meal, onClose, defaultServings = 2 }: Props) {
  const [servings, setServings] = useState(defaultServings);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setServings(defaultServings);
  }, [defaultServings, meal?.id]);

  if (!meal) return null;

  const scaledIngredients = scaleIngredients(meal.ingredients, servings);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {meal.type === "lunch" ? "Lunch" : "Diner"}
                {meal.day ? ` · ${meal.day}` : ""}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                {meal.name}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{meal.description}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: "Kcal p.p.", value: `${meal.calories}`, color: "bg-orange-50 text-orange-700" },
              { label: "Eiwit", value: `${meal.protein}g`, color: "bg-blue-50 text-blue-700" },
              { label: "Koolh.", value: `${meal.carbs}g`, color: "bg-yellow-50 text-yellow-700" },
              { label: "Vet", value: `${meal.fat}g`, color: "bg-red-50 text-red-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
                <p className="text-xs font-medium opacity-70">{label}</p>
                <p className="text-sm font-bold mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-xl p-3">
            <div>
              <p className="text-xs text-gray-500">Ingrediënten voor</p>
              <p className="text-sm font-semibold text-gray-900">
                {servings} {servings === 1 ? "persoon" : "personen"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-8 h-8 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold">{servings}</span>
              <button
                onClick={() => setServings(Math.min(8, servings + 1))}
                className="w-8 h-8 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-5">
            <ul className="space-y-1">
              {scaledIngredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bereidingswijze</h3>
            <ol className="space-y-2">
              {meal.instructions.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step.replace(/^Stap \d+:\s*/i, "")}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
