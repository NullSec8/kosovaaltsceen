import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { labelSchema } from "@/lib/validators";

export async function GET() {
  const labels = await prisma.label.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, _count: { select: { bands: true } } },
  });
  return NextResponse.json({ labels });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const body = await request.json();
  const parsed = labelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 1
      ? slugify(parsed.data.slug, { lower: true, strict: true, trim: true })
      : slugify(parsed.data.name, { lower: true, strict: true, trim: true });

  try {
    const label = await prisma.label.create({
      data: { name: parsed.data.name, slug },
    });
    return NextResponse.json({ label }, { status: 201 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Unique constraint") || raw.includes("slug")) {
      return NextResponse.json({ error: "A label with this name or slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}
