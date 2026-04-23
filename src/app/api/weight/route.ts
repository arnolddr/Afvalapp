import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.weightEntry.findMany({
    orderBy: { date: "desc" },
    take: 20,
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { weight } = await req.json();

  if (!weight || typeof weight !== "number" || weight < 20 || weight > 500) {
    return NextResponse.json({ error: "Ongeldig gewicht" }, { status: 400 });
  }

  const entry = await prisma.weightEntry.create({
    data: { weight, unit: "kg" },
  });

  return NextResponse.json(entry, { status: 201 });
}
