import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { bandSuggestionSchema } from "@/lib/validators";

/** Public: submit a band suggestion */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bandSuggestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (typeof (prisma as { bandSuggestion?: { create: unknown } }).bandSuggestion?.create !== "function") {
    return NextResponse.json(
      { error: "Suggestions are temporarily unavailable. Please try the email link below." },
      { status: 503 }
    );
  }

  try {
    const suggestion = await prisma.bandSuggestion.create({
      data: {
        bandName: parsed.data.bandName.trim(),
        city: parsed.data.city.trim(),
        genres: parsed.data.genres.trim(),
        yearFounded: parsed.data.yearFounded ?? null,
        links: parsed.data.links?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        contributorEmail: parsed.data.contributorEmail?.trim() || null,
      },
    });
    return NextResponse.json({ suggestion, ok: true }, { status: 201 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: raw || "Could not save suggestion." }, { status: 500 });
  }
}

/** Admin: list all suggestions */
export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  if (typeof (prisma as { bandSuggestion?: { findMany: unknown } }).bandSuggestion?.findMany !== "function") {
    return NextResponse.json({ suggestions: [] });
  }
  try {
    const suggestions = await prisma.bandSuggestion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
