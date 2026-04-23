import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMealPlan } from "@/lib/mealPlanGenerator";

export async function POST(req: NextRequest) {
  const { weight } = await req.json();

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  const { weekStart, weekEnd, targetCalories, meals } =
    await generateMealPlan(weight);

  const mealPlan = await prisma.mealPlan.create({
    data: {
      weekStart,
      weekEnd,
      weight,
      targetCalories,
      meals: {
        create: meals.map((meal) => ({
          day: meal.day,
          dayIndex: meal.dayIndex,
          type: meal.type,
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          ingredients: JSON.stringify(meal.ingredients),
          instructions: JSON.stringify(meal.instructions),
        })),
      },
    },
    include: {
      meals: { orderBy: [{ dayIndex: "asc" }, { type: "asc" }] },
    },
  });

  return NextResponse.json({
    ...mealPlan,
    weekStart: mealPlan.weekStart.toISOString(),
    weekEnd: mealPlan.weekEnd.toISOString(),
    generatedAt: mealPlan.generatedAt.toISOString(),
    meals: mealPlan.meals.map((meal) => ({
      ...meal,
      ingredients: JSON.parse(meal.ingredients),
      instructions: JSON.parse(meal.instructions),
    })),
  });
}
