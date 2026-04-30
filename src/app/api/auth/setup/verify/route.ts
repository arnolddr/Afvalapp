import { NextRequest, NextResponse } from "next/server";
import { totpVerify } from "@/lib/totp";
import db from "@/lib/db";

interface UserRow { id: number; totpSecret: string | null }

export async function POST(req: NextRequest) {
  const { userId, code } = await req.json() as { userId: number; code: string };

  const user = db.prepare("SELECT id, totpSecret FROM User WHERE id = ?").get(userId) as UserRow | undefined;
  if (!user?.totpSecret) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  const valid = totpVerify(code, user.totpSecret);
  if (!valid) {
    return NextResponse.json({ error: "Ongeldige code. Probeer opnieuw." }, { status: 400 });
  }

  db.prepare("UPDATE User SET totpVerified = 1 WHERE id = ?").run(userId);
  return NextResponse.json({ ok: true });
}
