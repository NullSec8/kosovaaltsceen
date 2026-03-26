import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators";

export async function GET() {
  if (typeof (prisma as { event?: { findMany: unknown } }).event?.findMany !== "function") {
    return NextResponse.json({ events: [] });
  }
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "desc" },
    });
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rawUrl = body && typeof body === "object" && "url" in body ? body.url : undefined;
  const url =
    typeof rawUrl === "string" && rawUrl.trim().length > 0
      ? (() => {
          try {
            new URL(rawUrl.trim());
            return rawUrl.trim();
          } catch {
            return null;
          }
        })()
      : null;

  if (typeof (prisma as { event?: { create: unknown } }).event?.create !== "function") {
    return NextResponse.json(
      {
        error:
          "Event model not available. Stop the dev server, run: npx prisma generate, then start it again.",
      },
      { status: 503 }
    );
  }

  try {
    const event = await prisma.event.create({
      data: {
        title: parsed.data.title,
        venue: parsed.data.venue,
        eventDate: parsed.data.eventDate,
        description: parsed.data.description?.trim() || null,
        lineup: parsed.data.lineup?.trim() || null,
        url,
      },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}
