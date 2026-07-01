import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSessionProfile, SESSION_COOKIE } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Ongeldig id" }, { status: 400 });
  }

  const entry = db.prepare("SELECT profile FROM WeightEntry WHERE id = ?").get(numId) as
    | { profile: string }
    | undefined;
  if (!entry) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  // Accounts met een gekoppeld profiel mogen alleen eigen metingen verwijderen
  const session = getSessionProfile(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.profile !== null && session.profile !== entry.profile) {
    return NextResponse.json(
      { error: "Je kunt alleen metingen van je eigen profiel verwijderen" },
      { status: 403 }
    );
  }

  db.prepare("DELETE FROM WeightEntry WHERE id = ?").run(numId);
  return NextResponse.json({ ok: true });
}
