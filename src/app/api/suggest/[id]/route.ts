import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

const STATUSES = ["PENDING", "ADDED", "DISMISSED"] as const;

/** Admin: update suggestion status */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const body = await request.json();
  const status = body?.status;
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status. Use PENDING, ADDED, or DISMISSED." }, { status: 400 });
  }

  if (typeof (prisma as { bandSuggestion?: { update: unknown } }).bandSuggestion?.update !== "function") {
    return NextResponse.json({ error: "Suggestions unavailable." }, { status: 503 });
  }

  try {
    const suggestion = await prisma.bandSuggestion.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ suggestion });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Record") && raw.includes("not found")) {
      return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });
    }
    return NextResponse.json({ error: raw || "Could not update." }, { status: 500 });
  }
}
