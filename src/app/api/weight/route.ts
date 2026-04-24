import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const entries = db
    .prepare(
      "SELECT * FROM WeightEntry ORDER BY date DESC, id DESC LIMIT 20"
    )
    .all();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { weight } = await req.json();

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  const result = db
    .prepare("INSERT INTO WeightEntry (weight) VALUES (?) RETURNING *")
    .get(weight);

  return NextResponse.json(result, { status: 201 });
}
