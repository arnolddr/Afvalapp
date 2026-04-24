import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface ProfileRow {
  id: number;
  name: string;
  eatsSnacks: number;
  height: number;
  age: number;
  gender: string;
}

export async function GET() {
  const profiles = db
    .prepare("SELECT id, name, eatsSnacks, height, age, gender FROM Profile ORDER BY id ASC")
    .all() as ProfileRow[];
  return NextResponse.json(
    profiles.map((p) => ({ ...p, eatsSnacks: p.eatsSnacks === 1 }))
  );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { name } = body;
  if (typeof name !== "string") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (typeof body.eatsSnacks === "boolean") {
    setClauses.push("eatsSnacks = ?");
    values.push(body.eatsSnacks ? 1 : 0);
  }
  if (typeof body.height === "number" && body.height >= 100 && body.height <= 250) {
    setClauses.push("height = ?");
    values.push(Math.round(body.height));
  }
  if (typeof body.age === "number" && body.age >= 10 && body.age <= 120) {
    setClauses.push("age = ?");
    values.push(Math.round(body.age));
  }
  if (body.gender === "man" || body.gender === "vrouw") {
    setClauses.push("gender = ?");
    values.push(body.gender);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "Geen wijzigingen" }, { status: 400 });
  }

  values.push(name);
  db.prepare(`UPDATE Profile SET ${setClauses.join(", ")} WHERE name = ?`).run(...values);
  return NextResponse.json({ ok: true });
}
