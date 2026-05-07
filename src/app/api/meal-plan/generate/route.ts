import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateMealPlan } from "@/lib/mealPlanGenerator";

export async function POST(req: NextRequest) {
  const { weight, profile = "Ik", weekStart: weekStartStr, seed } = await req.json() as {
    weight: number; profile?: string; weekStart?: string; seed?: number;
  };
  const weekStartOverride = weekStartStr ? new Date(weekStartStr) : undefined;

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  const profileRow = db
    .prepare("SELECT height, age, gender FROM Profile WHERE name = ?")
    .get(profile) as { height: number; age: number; gender: string } | undefined;

  const dislikedRows = db
    .prepare("SELECT ingredient FROM DislikedIngredient")
    .all() as { ingredient: string }[];
  const dislikedIngredients = dislikedRows.map((r) => r.ingredient);

  const { weekStart, weekEnd, targetCalories, meals } = await generateMealPlan(
    weight,
    profileRow?.height ?? 170,
    profileRow?.age ?? 35,
    (profileRow?.gender ?? "man") as "man" | "vrouw",
    dislikedIngredients,
    weekStartOverride,
    seed
  );

  const weekStartISO = weekStart.toISOString();

  // Replace any existing plan(s) for this same week (1 plan per week)
  db.prepare("DELETE FROM MealPlan WHERE weekStart = ?").run(weekStartISO);

  const plan = db
    .prepare(
      `INSERT INTO MealPlan (weekStart, weekEnd, weight, targetCalories, profile)
       VALUES (?, ?, ?, ?, ?) RETURNING *`
    )
    .get(weekStartISO, weekEnd.toISOString(), weight, targetCalories, profile) as Record<string, unknown>;

  const insertMeal = db.prepare(
    `INSERT INTO Meal (mealPlanId, day, dayIndex, type, name, description,
      calories, protein, carbs, fat, ingredients, instructions, baseCalories)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction(() => {
    for (const meal of meals) {
      insertMeal.run(
        plan.id, meal.day, meal.dayIndex, meal.type,
        meal.name, meal.description, meal.calories,
        meal.protein, meal.carbs, meal.fat,
        JSON.stringify(meal.ingredients),
        JSON.stringify(meal.instructions),
        meal.baseCalories
      );
    }
  });
  insertMany();

  // Keep only the 2 most recent weekly plans — delete any older ones
  const allPlans = db
    .prepare("SELECT id FROM MealPlan ORDER BY generatedAt DESC")
    .all() as { id: number }[];
  if (allPlans.length > 2) {
    for (const old of allPlans.slice(2)) {
      db.prepare("DELETE FROM MealPlan WHERE id = ?").run(old.id);
    }
  }

  const savedMeals = db
    .prepare("SELECT * FROM Meal WHERE mealPlanId = ? ORDER BY dayIndex ASC, type ASC")
    .all(plan.id as number) as Record<string, unknown>[];

  return NextResponse.json({
    ...plan,
    meals: savedMeals.map((meal) => ({
      ...meal,
      ingredients: JSON.parse(meal.ingredients as string),
      instructions: JSON.parse(meal.instructions as string),
    })),
  });
}
