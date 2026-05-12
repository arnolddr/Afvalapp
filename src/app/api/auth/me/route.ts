import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession, SESSION_COOKIE } from "@/lib/auth";
import db from "@/lib/db";

interface UserRow { username: string; profile: string | null }

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const session = validateSession(token);
  if (!session) return NextResponse.json({ error: "Sessie verlopen" }, { status: 401 });

  const user = db.prepare("SELECT username, profile FROM User WHERE id = ?").get(session.id) as UserRow | undefined;
  if (!user) return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });

  return NextResponse.json({ username: user.username, profile: user.profile });
}
