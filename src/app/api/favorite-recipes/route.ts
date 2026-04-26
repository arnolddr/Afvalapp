import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface Row { name: string }

export async function GET() {
  const rows = db.prepare("SELECT name FROM FavoriteRecipe").all() as Row[];
  return NextResponse.json(rows.map((r) => r.name));
}

export async function POST(req: NextRequest) {
  const { name } = await req.json() as { name: string };
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  db.prepare("INSERT OR IGNORE INTO FavoriteRecipe (name) VALUES (?)").run(name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { name } = await req.json() as { name: string };
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  db.prepare("DELETE FROM FavoriteRecipe WHERE name = ?").run(name);
  return NextResponse.json({ ok: true });
}
