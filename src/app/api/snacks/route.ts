import { NextResponse } from "next/server";
import db from "@/lib/db";
import { weekSnacks } from "@/lib/snacks";

const DAYS = ["Zaterdag", "Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

export async function GET() {
  const plan = db
    .prepare("SELECT * FROM MealPlan ORDER BY generatedAt DESC LIMIT 1")
    .get() as Record<string, unknown> | undefined;

  if (!plan) {
    return NextResponse.json({ profiles: [] });
  }

  const profiles = db
    .prepare("SELECT name, eatsSnacks FROM Profile WHERE eatsSnacks = 1")
    .all() as { name: string; eatsSnacks: number }[];

  const seed = Math.floor(
    new Date(plan.weekStart as string).getTime() / (7 * 24 * 60 * 60 * 1000)
  );

  const result = profiles.map((p) => {
    const snacks = weekSnacks(p.name, seed);
    const daily = DAYS.map((day, i) => ({
      day,
      morning: snacks[i * 2],
      afternoon: snacks[i * 2 + 1],
    }));
    return { profile: p.name, daily };
  });

  return NextResponse.json({ profiles: result });
}
