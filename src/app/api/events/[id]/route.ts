import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const body = await request.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (typeof (prisma as { event?: { update: unknown } }).event?.update !== "function") {
    return NextResponse.json(
      { error: "Event model not available. Stop the dev server, run: npx prisma generate, then start it again." },
      { status: 503 }
    );
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

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: parsed.data.title,
        venue: parsed.data.venue,
        eventDate: parsed.data.eventDate,
        description: parsed.data.description?.trim() || null,
        lineup: parsed.data.lineup?.trim() || null,
        url,
      },
    });
    return NextResponse.json({ event });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Record to update not found") || raw.includes("Record not found")) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;

  if (typeof (prisma as { event?: { delete: unknown } }).event?.delete !== "function") {
    return NextResponse.json(
      { error: "Event model not available. Stop the dev server, run: npx prisma generate, then start it again." },
      { status: 503 }
    );
  }

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Record to delete not found") || raw.includes("Record not found")) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}
