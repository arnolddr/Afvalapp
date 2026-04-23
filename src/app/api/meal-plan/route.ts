import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.mealPlan.findMany({
    orderBy: { generatedAt: "desc" },
    take: 5,
    include: {
      meals: { orderBy: [{ dayIndex: "asc" }, { type: "asc" }] },
    },
  });

  const serialized = plans.map((plan) => ({
    ...plan,
    weekStart: plan.weekStart.toISOString(),
    weekEnd: plan.weekEnd.toISOString(),
    generatedAt: plan.generatedAt.toISOString(),
    meals: plan.meals.map((meal) => ({
      ...meal,
      ingredients: JSON.parse(meal.ingredients),
      instructions: JSON.parse(meal.instructions),
    })),
  }));

  return NextResponse.json(serialized);
}
