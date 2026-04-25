import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

interface CheckedRow {
  data: string;
}

function getChecked(): Record<string, boolean> {
  const row = db.prepare("SELECT data FROM ShoppingChecked WHERE id = 1").get() as CheckedRow | undefined;
  try {
    return row ? JSON.parse(row.data) : {};
  } catch {
    return {};
  }
}

// GET — return current checked map
export function GET() {
  return NextResponse.json(getChecked());
}

// PATCH — toggle a single item: { item: string, checked: boolean }
export async function PATCH(req: NextRequest) {
  const { item, checked } = await req.json() as { item: string; checked: boolean };
  if (typeof item !== "string" || typeof checked !== "boolean") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const current = getChecked();
  current[item] = checked;
  db.prepare("UPDATE ShoppingChecked SET data = ? WHERE id = 1").run(JSON.stringify(current));
  return NextResponse.json(current);
}

// DELETE — clear all checked items
export function DELETE() {
  db.prepare("UPDATE ShoppingChecked SET data = '{}' WHERE id = 1").run();
  return NextResponse.json({});
}
