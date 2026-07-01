import crypto from "crypto";
import db from "./db";

export const SESSION_COOKIE = "afval_session";

export interface SessionUser {
  id: number;
  username: string;
}

interface PendingRow { userId: number }
interface SessionJoinRow { userId: number; username: string }

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // Unix timestamp
  db.prepare("INSERT INTO Session (token, userId, expiresAt) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return token;
}

export function validateSession(token: string): SessionUser | null {
  const row = db.prepare(`
    SELECT s.userId, u.username FROM Session s
    JOIN User u ON u.id = s.userId
    WHERE s.token = ? AND s.expiresAt > strftime('%s', 'now')
  `).get(token) as SessionJoinRow | undefined;
  return row ? { id: row.userId, username: row.username } : null;
}

export function deleteSession(token: string): void {
  db.prepare("DELETE FROM Session WHERE token = ?").run(token);
}

export interface UserRow {
  id: number;
  username: string;
  passwordHash: string;
  totpSecret: string | null;
  totpVerified: number;
}

// Profile linked to the session's account. { ok: false } = no valid session;
// profile null = legacy account without linked profile (may edit everything).
export function getSessionProfile(token: string | undefined): { ok: false } | { ok: true; profile: string | null } {
  if (!token) return { ok: false };
  const session = validateSession(token);
  if (!session) return { ok: false };
  const row = db.prepare("SELECT profile FROM User WHERE id = ?").get(session.id) as { profile: string | null } | undefined;
  return { ok: true, profile: row?.profile ?? null };
}

export function getUserByUsername(username: string): UserRow | null {
  return db.prepare("SELECT * FROM User WHERE username = ?").get(username) as UserRow | null;
}

export function getUserById(id: number): UserRow | null {
  return db.prepare("SELECT * FROM User WHERE id = ?").get(id) as UserRow | null;
}

export function countUsers(): number {
  const row = db.prepare("SELECT COUNT(*) as n FROM User").get() as { n: number };
  return row.n;
}

export function createPendingAuth(userId: number): string {
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // Unix timestamp, 10 minuten
  db.prepare("DELETE FROM PendingAuth WHERE userId = ?").run(userId);
  db.prepare("INSERT INTO PendingAuth (token, userId, expiresAt) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return token;
}

export function consumePendingAuth(token: string): number | null {
  const row = db.prepare(
    "SELECT userId FROM PendingAuth WHERE token = ? AND expiresAt > strftime('%s', 'now')"
  ).get(token) as PendingRow | undefined;
  if (row) db.prepare("DELETE FROM PendingAuth WHERE token = ?").run(token);
  return row?.userId ?? null;
}

// Simple in-memory rate limiting (resets on server restart, fine for 2 users)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function isRateLimited(username: string): boolean {
  const entry = failedAttempts.get(username.toLowerCase());
  if (!entry) return false;
  if (entry.lockedUntil > 0 && Date.now() > entry.lockedUntil) {
    failedAttempts.delete(username.toLowerCase());
    return false;
  }
  return entry.count >= 5;
}

export function recordFailedAttempt(username: string): void {
  const key = username.toLowerCase();
  const entry = failedAttempts.get(key) ?? { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= 5) entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  failedAttempts.set(key, entry);
}

export function clearFailedAttempts(username: string): void {
  failedAttempts.delete(username.toLowerCase());
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
  // secure=true on HTTPS (production/Vercel), false on local HTTP
  secure: process.env.NODE_ENV === "production",
};

// Rate limiting for setup and verify endpoints (IP-based)
const setupAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function isSetupRateLimited(ip: string): boolean {
  const entry = setupAttempts.get(ip);
  if (!entry) return false;
  if (entry.lockedUntil > 0 && Date.now() > entry.lockedUntil) {
    setupAttempts.delete(ip);
    return false;
  }
  return entry.count >= 5;
}

export function recordSetupAttempt(ip: string): void {
  const entry = setupAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= 5) entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  setupAttempts.set(ip, entry);
}
