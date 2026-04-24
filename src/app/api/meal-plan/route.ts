import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { calculateWeightLossCalories } from "@/lib/calories";

export async function GET(req: NextRequest) {
  const profile = req.nextUrl.searchParams.get("profile") || "Ik";

  // Get latest weight and body data for this profile so we can recalculate daily
  const latestEntry = db
    .prepare("SELECT weight FROM WeightEntry WHERE profile = ? ORDER BY date DESC, id DESC LIMIT 1")
    .get(profile) as { weight: number } | undefined;

  const profileData = db
    .prepare("SELECT height, age, gender FROM Profile WHERE name = ?")
    .get(profile) as { height: number; age: number; gender: string } | undefined;

  const plans = db
    .prepare("SELECT * FROM MealPlan ORDER BY generatedAt DESC LIMIT 2")
    .all() as Record<string, unknown>[];

  const result = plans.map((plan) => {
    const meals = db
      .prepare("SELECT * FROM Meal WHERE mealPlanId = ? ORDER BY dayIndex ASC, type ASC")
      .all(plan.id as number) as Record<string, unknown>[];

    // Recalculate target based on today's weight; fall back to stored value
    let targetCalories = plan.targetCalories as number;
    let mealFactor = 1;

    if (latestEntry && profileData) {
      const newTarget = calculateWeightLossCalories(
        latestEntry.weight,
        profileData.height ?? 170,
        profileData.age ?? 35,
        (profileData.gender ?? "man") as "man" | "vrouw"
      );
      mealFactor = newTarget / targetCalories;
      targetCalories = newTarget;
    }

    return {
      ...plan,
      targetCalories,
      meals: meals.map((meal) => ({
        ...meal,
        calories: Math.round((meal.calories as number) * mealFactor),
        protein: Math.round((meal.protein as number) * mealFactor),
        carbs: Math.round((meal.carbs as number) * mealFactor),
        fat: Math.round((meal.fat as number) * mealFactor),
        ingredients: JSON.parse(meal.ingredients as string),
        instructions: JSON.parse(meal.instructions as string),
      })),
    };
  });

  return NextResponse.json(result);
}
