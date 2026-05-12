import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, pin } = body;

  if (typeof name !== "string" || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const profile = db.prepare("SELECT pin FROM Profile WHERE name = ?").get(name) as { pin: string | null } | undefined;

  if (!profile || profile.pin === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const hash = createHash("sha256").update(pin).digest("hex");
  return NextResponse.json({ ok: hash === profile.pin });
}
