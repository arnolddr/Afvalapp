import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { newTotpSecret, totpURI } from "@/lib/totp";
import qrcode from "qrcode";
import db from "@/lib/db";
import { countUsers } from "@/lib/auth";

export async function GET() {
  const count = countUsers();
  return NextResponse.json({ setupComplete: count >= 2, usersCreated: count });
}

export async function POST(req: NextRequest) {
  const count = countUsers();
  if (count >= 2) {
    return NextResponse.json({ error: "Setup al voltooid." }, { status: 403 });
  }

  const { username, password } = await req.json() as { username: string; password: string };

  if (!username || username.length < 2) {
    return NextResponse.json({ error: "Gebruikersnaam te kort." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Wachtwoord minimaal 8 tekens." }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM User WHERE username = ?").get(username);
  if (existing) {
    return NextResponse.json({ error: "Gebruikersnaam al in gebruik." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  const totpSecret = newTotpSecret();

  const result = db
    .prepare("INSERT INTO User (username, passwordHash, totpSecret, totpVerified) VALUES (?, ?, ?, 0)")
    .run(username, passwordHash, totpSecret);

  const userId = result.lastInsertRowid as number;
  const otpauthUrl = totpURI(username, totpSecret);
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl, { width: 256, margin: 2 });

  return NextResponse.json({ userId, username, qrDataUrl });
}
