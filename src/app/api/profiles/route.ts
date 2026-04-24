import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const profiles = db
    .prepare("SELECT id, name, eatsSnacks FROM Profile ORDER BY id ASC")
    .all() as { id: number; name: string; eatsSnacks: number }[];
  return NextResponse.json(
    profiles.map((p) => ({ ...p, eatsSnacks: p.eatsSnacks === 1 }))
  );
}

export async function PATCH(req: NextRequest) {
  const { name, eatsSnacks } = await req.json();
  if (typeof name !== "string" || typeof eatsSnacks !== "boolean") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }
  db.prepare("UPDATE Profile SET eatsSnacks = ? WHERE name = ?").run(
    eatsSnacks ? 1 : 0,
    name
  );
  return NextResponse.json({ ok: true });
}
