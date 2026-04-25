import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT mealName FROM DislikedMeal ORDER BY mealName").all() as { mealName: string }[];
  return NextResponse.json(rows.map((r) => r.mealName));
}

export async function POST(req: NextRequest) {
  const { mealName } = await req.json();
  if (!mealName || typeof mealName !== "string") {
    return NextResponse.json({ error: "Ongeldige naam" }, { status: 400 });
  }
  db.prepare("INSERT OR IGNORE INTO DislikedMeal (mealName) VALUES (?)").run(mealName);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { mealName } = await req.json();
  db.prepare("DELETE FROM DislikedMeal WHERE mealName = ?").run(mealName);
  return NextResponse.json({ ok: true });
}
