import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { newsPostSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;
  const body = await request.json();
  const parsed = newsPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 1
      ? slugify(parsed.data.slug, { lower: true, strict: true, trim: true })
      : slugify(parsed.data.title, { lower: true, strict: true, trim: true });

  try {
    const post = await prisma.newsPost.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug,
        body: parsed.data.body,
        type: parsed.data.type,
        publishedAt: parsed.data.publishedAt ?? undefined,
      },
    });
    return NextResponse.json({ post });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Record to update not found") || raw.includes("Record not found")) {
      return NextResponse.json({ error: "News post not found." }, { status: 404 });
    }
    if (raw.includes("Unique constraint") || raw.includes("slug")) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await params;

  try {
    await prisma.newsPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Record to delete not found") || raw.includes("Record not found")) {
      return NextResponse.json({ error: "News post not found." }, { status: 404 });
    }
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}
