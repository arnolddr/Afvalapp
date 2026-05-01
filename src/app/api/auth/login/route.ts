import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { totpVerify } from "@/lib/totp";
import { cookies } from "next/headers";
import {
  getUserByUsername,
  createSession,
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  SESSION_COOKIE,
  COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password, code } = await req.json() as Record<string, string>;

  if (!username || !password || !code) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  if (isRateLimited(username)) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer het over 15 minuten opnieuw." }, { status: 429 });
  }

  const user = getUserByUsername(username.trim());
  if (!user) {
    recordFailedAttempt(username);
    return NextResponse.json({ error: "Gebruikersnaam, wachtwoord of code onjuist." }, { status: 401 });
  }

  const passwordOk = await compare(password, user.passwordHash);
  if (!passwordOk) {
    recordFailedAttempt(username);
    return NextResponse.json({ error: "Gebruikersnaam, wachtwoord of code onjuist." }, { status: 401 });
  }

  if (!user.totpSecret || !user.totpVerified) {
    return NextResponse.json({ error: "Account niet volledig ingesteld. Ga naar /setup." }, { status: 403 });
  }

  const totpOk = totpVerify(code, user.totpSecret);
  if (!totpOk) {
    recordFailedAttempt(username);
    return NextResponse.json({ error: "Gebruikersnaam, wachtwoord of code onjuist." }, { status: 401 });
  }

  clearFailedAttempts(username);
  const sessionToken = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
