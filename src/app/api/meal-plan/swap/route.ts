import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { LUNCH_RECIPES, DINNER_RECIPES } from "@/lib/mealPlanGenerator";
import { calculateLunchDinnerSplit } from "@/lib/calories";

interface MealRow { mealPlanId: number; type: string; }
interface PlanRow { targetCalories: number; }

export async function POST(req: NextRequest) {
  const { mealId, newName } = await req.json() as { mealId: number; newName: string };

  const recipe = [...LUNCH_RECIPES, ...DINNER_RECIPES].find((r) => r.name === newName);
  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

  const meal = db
    .prepare("SELECT mealPlanId, type FROM Meal WHERE id = ?")
    .get(mealId) as MealRow | undefined;
  if (!meal) return NextResponse.json({ error: "Meal not found" }, { status: 404 });

  const plan = db
    .prepare("SELECT targetCalories FROM MealPlan WHERE id = ?")
    .get(meal.mealPlanId) as PlanRow | undefined;

  const targetCalories = plan?.targetCalories || 1800;
  const split = calculateLunchDinnerSplit(targetCalories);
  const mealTarget = meal.type === "lunch" ? split.lunch : split.dinner;
  const factor = mealTarget / recipe.baseCalories;

  db.prepare(`
    UPDATE Meal SET
      name = ?, description = ?, calories = ?, protein = ?, carbs = ?, fat = ?,
      ingredients = ?, instructions = ?, baseCalories = ?
    WHERE id = ?
  `).run(
    recipe.name,
    recipe.description,
    Math.round(mealTarget),
    Math.round(recipe.protein * factor),
    Math.round(recipe.carbs * factor),
    Math.round(recipe.fat * factor),
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.instructions),
    recipe.baseCalories,
    mealId
  );

  return NextResponse.json({ ok: true });
}
