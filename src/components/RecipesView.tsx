"use client";

import { useState, useEffect, useRef } from "react";
import { MealData, MealPlan } from "@/types";
import RecipeModal from "./RecipeModal";
import { LUNCH_RECIPES, DINNER_RECIPES, Recipe } from "@/lib/mealPlanGenerator";
import { calculateRecipeMacros } from "@/lib/nutrition";
import { getCached, setCached, fetchQueued } from "@/lib/offlineStore";

interface Props {
  plan: MealPlan | null;
  activeProfile: string;
  onMealSwapped?: () => void;
}

const DAY_ORDER = ["Zaterdag", "Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

function staticToMealData(r: Recipe, type: "lunch" | "dinner"): MealData {
  const macros = calculateRecipeMacros(r.ingredients);
  return {
    id: 0, day: "", dayIndex: 0, type,
    name: r.name, description: r.description,
    calories: macros.calories, baseCalories: macros.calories,
    protein: macros.protein, carbs: macros.carbs, fat: macros.fat,
    ingredients: r.ingredients, instructions: r.instructions,
  };
}

function isExcluded(recipe: Recipe, disliked: string[]): string | null {
  if (disliked.length === 0) return null;
  for (const ing of recipe.ingredients) {
    for (const d of disliked) {
      if (ing.toLowerCase().includes(d)) return d;
    }
  }
  return null;
}

type ViewTab = "week" | "alle" | "favorieten";

export default function RecipesView({ plan, activeProfile, onMealSwapped }: Props) {
  const [viewTab, setViewTab] = useState<ViewTab>(plan ? "week" : "alle");
  const [typeFilter, setTypeFilter] = useState<"alles" | "lunch" | "diner">("alles");
  const [selected, setSelected] = useState<MealData | null>(null);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [swapping, setSwapping] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cached = getCached<string[]>("disliked");
    if (cached) setDisliked(cached);

    fetch("/api/disliked-ingredients")
      .then((r) => r.json())
      .then((data: string[]) => {
        setDisliked(data);
        setCached("disliked", data);
      })
      .catch(() => {});

    const cachedFavs = getCached<string[]>("favorites");
    if (cachedFavs) setFavorites(new Set(cachedFavs));

    fetch("/api/favorite-recipes")
      .then((r) => r.json())
      .then((data: string[]) => {
        setFavorites(new Set(data));
        setCached("favorites", data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (plan) setViewTab("week");
  }, [plan?.id]);

  async function addIngredient() {
    const val = input.trim().toLowerCase();
    if (!val || val.length < 2 || disliked.includes(val)) {
      setInput("");
      return;
    }
    const next = [...disliked, val].sort();
    setDisliked(next);
    setCached("disliked", next);
    setInput("");
    inputRef.current?.focus();
    await fetchQueued("/api/disliked-ingredients", "POST", { ingredient: val });
  }

  async function removeIngredient(ing: string) {
    const next = disliked.filter((d) => d !== ing);
    setDisliked(next);
    setCached("disliked", next);
    await fetchQueued("/api/disliked-ingredients", "DELETE", { ingredient: ing });
  }

  async function toggleFavorite(name: string) {
    const isFav = favorites.has(name);
    const next = new Set(favorites);
    if (isFav) next.delete(name); else next.add(name);
    setFavorites(next);
    setCached("favorites", Array.from(next));
    await fetchQueued(
      "/api/favorite-recipes",
      isFav ? "DELETE" : "POST",
      { name }
    );
  }

  async function swapMeal(meal: MealData, type: "lunch" | "dinner") {
    if (!plan || swapping !== null) return;

    const pool = (type === "lunch" ? LUNCH_RECIPES : DINNER_RECIPES)
      .filter((r) => isExcluded(r, disliked) === null);

    const usedNames = new Set(plan.meals.map((m) => m.name));
    usedNames.delete(meal.name);
    const candidates = pool.filter((r) => !usedNames.has(r.name));
    const finalPool = candidates.length > 0 ? candidates : pool;
    if (finalPool.length === 0) return;

    const pick = finalPool[Math.floor(Math.random() * finalPool.length)];

    setSwapping(meal.id);
    try {
      const res = await fetch("/api/meal-plan/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: meal.id, newName: pick.name }),
      });
      if (res.ok) onMealSwapped?.();
    } finally {
      setSwapping(null);
    }
  }

  const allStatic = [
    ...LUNCH_RECIPES.map((r) => ({ data: staticToMealData(r, "lunch"), recipe: r })),
    ...DINNER_RECIPES.map((r) => ({ data: staticToMealData(r, "dinner"), recipe: r })),
  ];

  const excludedCount = allStatic.filter(({ recipe }) => isExcluded(recipe, disliked) !== null).length;

  function MealRow({
    meal,
    recipe,
    onSwap,
  }: {
    meal: MealData;
    recipe?: Recipe;
    onSwap?: () => void;
  }) {
    const excluded = recipe ? isExcluded(recipe, disliked) : null;
    const kcal = meal.allCalories?.[activeProfile] ?? meal.calories;
    const isFav = favorites.has(meal.name);
    return (
      <div className={`flex items-stretch hover:bg-green-50 transition-colors ${excluded ? "opacity-60" : ""}`}>
        <button
          onClick={() => setSelected(meal)}
          className="flex-1 text-left px-4 py-3 min-w-0 group"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 truncate">
                {meal.name}
              </p>
              {excluded && (
                <p className="text-xs text-red-500 mt-0.5">
                  Uitgesloten — bevat &ldquo;{excluded}&rdquo;
                </p>
              )}
            </div>
            <p className="text-sm font-medium text-orange-600 flex-shrink-0">{kcal} kcal</p>
          </div>
        </button>
        <button
          onClick={() => toggleFavorite(meal.name)}
          title={isFav ? "Verwijder uit favorieten" : "Markeer als favoriet"}
          className={`px-3 border-l border-gray-100 transition-colors flex-shrink-0 text-base ${
            isFav
              ? "text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50"
              : "text-gray-300 hover:text-yellow-400 hover:bg-yellow-50"
          }`}
        >
          ★
        </button>
        {excluded && onSwap && (
          <button
            onClick={onSwap}
            disabled={swapping === meal.id}
            title="Verwissel dit gerecht"
            className="px-3 border-l border-gray-100 text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors flex-shrink-0 disabled:opacity-40 text-base"
          >
            {swapping === meal.id ? (
              <span className="text-xs">...</span>
            ) : (
              "↻"
            )}
          </button>
        )}
      </div>
    );
  }

  const planDays = DAY_ORDER.map((day, idx) => ({
    day,
    lunch: plan?.meals.find((m) => m.dayIndex === idx && m.type === "lunch") ?? null,
    dinner: plan?.meals.find((m) => m.dayIndex === idx && m.type === "dinner") ?? null,
  }));

  const visibleStatic = allStatic.filter(
    ({ data }) =>
      typeFilter === "alles" ||
      (typeFilter === "lunch" && data.type === "lunch") ||
      (typeFilter === "diner" && data.type === "dinner")
  );

  return (
    <div className="space-y-4">
      {/* Ingredient preferences card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Ingrediënten die we niet lusten</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Recepten met deze ingrediënten worden overgeslagen bij het genereren
              {excludedCount > 0 && ` · ${excludedCount} recept${excludedCount === 1 ? "" : "en"} uitgesloten`}
            </p>
          </div>
        </div>

        {disliked.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {disliked.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  className="text-red-400 hover:text-red-700 leading-none ml-0.5"
                  title="Verwijderen"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            placeholder="Bijv. zalm, feta, tonijn..."
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={addIngredient}
            disabled={input.trim().length < 2}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-green-700 transition-colors"
          >
            Toevoegen
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {plan && (
          <button
            onClick={() => setViewTab("week")}
            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
              viewTab === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Deze week
          </button>
        )}
        <button
          onClick={() => setViewTab("alle")}
          className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
            viewTab === "alle" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Alle recepten
        </button>
        <button
          onClick={() => setViewTab("favorieten")}
          className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
            viewTab === "favorieten" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ★ Favorieten{favorites.size > 0 && ` (${favorites.size})`}
        </button>
      </div>

      {/* WEEK TAB */}
      {viewTab === "week" && plan && (
        <div className="space-y-3">
          {planDays.map(({ day, lunch, dinner }) => {
            const lunchRecipe = lunch
              ? [...LUNCH_RECIPES, ...DINNER_RECIPES].find((r) => r.name === lunch.name)
              : null;
            const dinnerRecipe = dinner
              ? [...LUNCH_RECIPES, ...DINNER_RECIPES].find((r) => r.name === dinner.name)
              : null;
            const lunchExcluded = lunchRecipe ? isExcluded(lunchRecipe, disliked) !== null : false;
            const dinnerExcluded = dinnerRecipe ? isExcluded(dinnerRecipe, disliked) !== null : false;
            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">{day}</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {lunch ? (
                    <MealRow
                      meal={lunch}
                      recipe={lunchRecipe ?? undefined}
                      onSwap={lunchExcluded ? () => swapMeal(lunch, "lunch") : undefined}
                    />
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-400">☀️ Lunch — niet beschikbaar</p>
                  )}
                  {dinner ? (
                    <MealRow
                      meal={dinner}
                      recipe={dinnerRecipe ?? undefined}
                      onSwap={dinnerExcluded ? () => swapMeal(dinner, "dinner") : undefined}
                    />
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-400">🌙 Diner — niet beschikbaar</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ALLE RECEPTEN TAB */}
      {viewTab === "alle" && (
        <>
          <div className="flex gap-2">
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
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {visibleStatic.map(({ data, recipe }) => (
              <MealRow key={data.name} meal={data} recipe={recipe} />
            ))}
          </div>
        </>
      )}

      {/* FAVORIETEN TAB */}
      {viewTab === "favorieten" && (
        favorites.size === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-3xl mb-3">★</p>
            <p className="text-gray-600 font-medium">Nog geen favorieten</p>
            <p className="text-gray-400 text-sm mt-1">Druk op ★ bij een recept om het op te slaan.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {allStatic
              .filter(({ data }) => favorites.has(data.name))
              .map(({ data, recipe }) => (
                <MealRow key={data.name} meal={data} recipe={recipe} />
              ))}
          </div>
        )
      )}

      <RecipeModal meal={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
