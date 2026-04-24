import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { calculateWeightLossCalories } from "@/lib/calories";

interface ProfileRow {
  name: string;
  height: number;
  age: number;
  gender: string;
}

export async function GET(req: NextRequest) {
  const requestedProfile = req.nextUrl.searchParams.get("profile") || "Ik";

  // Calculate current calorie target for every profile that has weight data
  const profileRows = db
    .prepare("SELECT name, height, age, gender FROM Profile ORDER BY id ASC")
    .all() as ProfileRow[];

  const allTargets: Record<string, number> = {};
  for (const p of profileRows) {
    const latest = db
      .prepare("SELECT weight FROM WeightEntry WHERE profile = ? ORDER BY date DESC, id DESC LIMIT 1")
      .get(p.name) as { weight: number } | undefined;
    if (latest) {
      allTargets[p.name] = calculateWeightLossCalories(
        latest.weight,
        p.height ?? 170,
        p.age ?? 35,
        (p.gender ?? "man") as "man" | "vrouw"
      );
    }
  }

  const plans = db
    .prepare("SELECT * FROM MealPlan ORDER BY generatedAt DESC LIMIT 2")
    .all() as Record<string, unknown>[];

  const result = plans.map((plan) => {
    const storedTarget = plan.targetCalories as number;
    const myTarget = allTargets[requestedProfile] ?? storedTarget;
    const myFactor = myTarget / storedTarget;

    const meals = db
      .prepare("SELECT * FROM Meal WHERE mealPlanId = ? ORDER BY dayIndex ASC, type ASC")
      .all(plan.id as number) as Record<string, unknown>[];

    return {
      ...plan,
      targetCalories: myTarget,
      allTargets,
      meals: meals.map((meal) => {
        const storedCal = meal.calories as number;
        // Per-profile calories for each meal
        const allCalories: Record<string, number> = {};
        for (const [name, t] of Object.entries(allTargets)) {
          allCalories[name] = Math.round(storedCal * (t / storedTarget));
        }
        return {
          ...meal,
          calories: Math.round(storedCal * myFactor),
          protein: Math.round((meal.protein as number) * myFactor),
          carbs: Math.round((meal.carbs as number) * myFactor),
          fat: Math.round((meal.fat as number) * myFactor),
          allCalories,
          ingredients: JSON.parse(meal.ingredients as string),
          instructions: JSON.parse(meal.instructions as string),
        };
      }),
    };
  });

  return NextResponse.json(result);
}
