import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateMealPlan } from "@/lib/mealPlanGenerator";

export async function POST(req: NextRequest) {
  const { weight, profile = "Ik" } = await req.json();

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  const profileRow = db
    .prepare("SELECT height, age, gender FROM Profile WHERE name = ?")
    .get(profile) as { height: number; age: number; gender: string } | undefined;

  const { weekStart, weekEnd, targetCalories, meals } = await generateMealPlan(
    weight,
    profileRow?.height ?? 170,
    profileRow?.age ?? 35,
    (profileRow?.gender ?? "man") as "man" | "vrouw"
  );

  const plan = db
    .prepare(
      `INSERT INTO MealPlan (weekStart, weekEnd, weight, targetCalories)
       VALUES (?, ?, ?, ?) RETURNING *`
    )
    .get(
      weekStart.toISOString(),
      weekEnd.toISOString(),
      weight,
      targetCalories
    ) as Record<string, unknown>;

  const insertMeal = db.prepare(
    `INSERT INTO Meal (mealPlanId, day, dayIndex, type, name, description,
      calories, protein, carbs, fat, ingredients, instructions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertMany = db.transaction(() => {
    for (const meal of meals) {
      insertMeal.run(
        plan.id,
        meal.day,
        meal.dayIndex,
        meal.type,
        meal.name,
        meal.description,
        meal.calories,
        meal.protein,
        meal.carbs,
        meal.fat,
        JSON.stringify(meal.ingredients),
        JSON.stringify(meal.instructions)
      );
    }
  });
  insertMany();

  const savedMeals = db
    .prepare(
      "SELECT * FROM Meal WHERE mealPlanId = ? ORDER BY dayIndex ASC, type ASC"
    )
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
