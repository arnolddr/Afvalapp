import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionProfile, SESSION_COOKIE } from "@/lib/auth";

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
  let body: { weight?: unknown; profile?: unknown; notes?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }
  const { weight, notes } = body;
  const profile = typeof body.profile === "string" && body.profile ? body.profile : "Ik";

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  // Accounts met een gekoppeld profiel mogen alleen hun eigen gewicht invoeren
  const session = getSessionProfile(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.profile !== null && session.profile !== profile) {
    return NextResponse.json(
      { error: `Je kunt alleen gewicht invoeren voor je eigen profiel (${session.profile})` },
      { status: 403 }
    );
  }

  const cleanNotes =
    typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 500) : null;

  const result = db
    .prepare("INSERT INTO WeightEntry (weight, profile, notes) VALUES (?, ?, ?) RETURNING *")
    .get(weight, profile, cleanNotes);

  return NextResponse.json(result, { status: 201 });
}
