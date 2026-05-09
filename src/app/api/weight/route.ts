import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const profile = req.nextUrl.searchParams.get("profile") || "Ik";
  const entries = db
    .prepare(
      "SELECT * FROM WeightEntry WHERE profile = ? ORDER BY date DESC, id DESC LIMIT 365"
    )
    .all(profile);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { weight, profile = "Ik", notes } = await req.json();

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  const cleanNotes = typeof notes === "string" && notes.trim() ? notes.trim() : null;

  const result = db
    .prepare("INSERT INTO WeightEntry (weight, profile, notes) VALUES (?, ?, ?) RETURNING *")
    .get(weight, profile, cleanNotes);

  return NextResponse.json(result, { status: 201 });
}
