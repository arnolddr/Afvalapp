import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import db from "@/lib/db";

const PUBLIC_PREFIXES = [
  "/login",
  "/setup",
  "/api/auth/",
  "/sw.js",
  "/manifest.json",
  "/favicon.ico",
  "/icons/",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = request.cookies.get("afval_session")?.value;
  if (!token) return unauthenticated(request);

  try {
    const valid = db
      .prepare("SELECT 1 FROM Session WHERE token = ? AND expiresAt > datetime('now')")
      .get(token);
    if (!valid) return unauthenticated(request);
  } catch {
    // DB unavailable (e.g. during build) — let through
    return NextResponse.next();
  }

  return NextResponse.next();
}

function unauthenticated(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)" ],
};
