import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ error: "Ongeldig id" }, { status: 400 });
  }
  db.prepare("DELETE FROM WeightEntry WHERE id = ?").run(numId);
  return NextResponse.json({ ok: true });
}
