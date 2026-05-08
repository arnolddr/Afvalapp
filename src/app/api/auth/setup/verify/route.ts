import { NextRequest, NextResponse } from "next/server";
import { totpVerify } from "@/lib/totp";
import db from "@/lib/db";
import { isSetupRateLimited, recordSetupAttempt } from "@/lib/auth";

interface UserRow { id: number; totpSecret: string | null }

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (isSetupRateLimited(ip)) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer het over 15 minuten opnieuw." }, { status: 429 });
  }

  const { userId, code } = await req.json() as { userId: number; code: string };

  const user = db.prepare("SELECT id, totpSecret FROM User WHERE id = ?").get(userId) as UserRow | undefined;
  if (!user?.totpSecret) {
    recordSetupAttempt(ip);
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  const valid = totpVerify(code, user.totpSecret);
  if (!valid) {
    recordSetupAttempt(ip);
    return NextResponse.json({ error: "Ongeldige code. Probeer opnieuw." }, { status: 400 });
  }

  db.prepare("UPDATE User SET totpVerified = 1 WHERE id = ?").run(userId);
  return NextResponse.json({ ok: true });
}
