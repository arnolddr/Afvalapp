import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { totpVerify } from "@/lib/totp";
import { cookies } from "next/headers";
import {
  getUserByUsername,
  getUserById,
  createPendingAuth,
  consumePendingAuth,
  createSession,
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  SESSION_COOKIE,
  COOKIE_OPTIONS,
} from "@/lib/auth";

// Step 1: verify username + password
async function handlePassword(username: string, password: string): Promise<NextResponse> {
  if (isRateLimited(username)) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer het over 15 minuten opnieuw." }, { status: 429 });
  }

  const user = getUserByUsername(username);
  if (!user) {
    recordFailedAttempt(username);
    return NextResponse.json({ error: "Gebruikersnaam of wachtwoord onjuist." }, { status: 401 });
  }

  const ok = await compare(password, user.passwordHash);
  if (!ok) {
    recordFailedAttempt(username);
    return NextResponse.json({ error: "Gebruikersnaam of wachtwoord onjuist." }, { status: 401 });
  }

  if (!user.totpSecret || !user.totpVerified) {
    return NextResponse.json({ error: "Account niet volledig ingesteld." }, { status: 403 });
  }

  clearFailedAttempts(username);
  const pendingToken = createPendingAuth(user.id);
  return NextResponse.json({ step: "totp", pendingToken });
}

// Step 2: verify TOTP code
async function handleTotp(pendingToken: string, code: string): Promise<NextResponse> {
  const userId = consumePendingAuth(pendingToken);
  if (!userId) {
    return NextResponse.json({ error: "Verificatiestap verlopen. Log opnieuw in." }, { status: 401 });
  }

  const user = getUserById(userId);
  if (!user?.totpSecret) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 401 });
  }

  const valid = totpVerify(code, user.totpSecret);
  if (!valid) {
    return NextResponse.json({ error: "Ongeldige authenticatorcode." }, { status: 401 });
  }

  const sessionToken = createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;

  if (body.username && body.password) {
    return handlePassword(body.username.trim(), body.password);
  }
  if (body.pendingToken && body.code) {
    return handleTotp(body.pendingToken, body.code);
  }
  return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
}
