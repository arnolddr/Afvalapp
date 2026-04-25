import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const rows = db
    .prepare("SELECT ingredient FROM DislikedIngredient ORDER BY ingredient")
    .all() as { ingredient: string }[];
  return NextResponse.json(rows.map((r) => r.ingredient));
}

export async function POST(req: NextRequest) {
  const { ingredient } = await req.json();
  if (!ingredient || typeof ingredient !== "string" || ingredient.trim().length < 2) {
    return NextResponse.json({ error: "Ongeldig ingrediënt" }, { status: 400 });
  }
  db.prepare("INSERT OR IGNORE INTO DislikedIngredient (ingredient) VALUES (?)").run(ingredient.trim().toLowerCase());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { ingredient } = await req.json();
  db.prepare("DELETE FROM DislikedIngredient WHERE ingredient = ?").run(ingredient);
  return NextResponse.json({ ok: true });
}
