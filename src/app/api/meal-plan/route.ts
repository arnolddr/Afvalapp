import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const plans = db
    .prepare("SELECT * FROM MealPlan ORDER BY generatedAt DESC LIMIT 5")
    .all() as Record<string, unknown>[];

  const result = plans.map((plan) => {
    const meals = db
      .prepare(
        "SELECT * FROM Meal WHERE mealPlanId = ? ORDER BY dayIndex ASC, type ASC"
      )
      .all(plan.id as number) as Record<string, unknown>[];

    return {
      ...plan,
      meals: meals.map((meal) => ({
        ...meal,
        ingredients: JSON.parse(meal.ingredients as string),
        instructions: JSON.parse(meal.instructions as string),
      })),
    };
  });

  return NextResponse.json(result);
}
