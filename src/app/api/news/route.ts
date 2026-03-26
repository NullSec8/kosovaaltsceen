import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { newsPostSchema } from "@/lib/validators";

export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, body: true, type: true, publishedAt: true, updatedAt: true },
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

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
    const post = await prisma.newsPost.create({
      data: {
        title: parsed.data.title,
        slug,
        body: parsed.data.body,
        type: parsed.data.type,
        publishedAt: parsed.data.publishedAt ?? new Date(),
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    if (raw.includes("Unique constraint") || raw.includes("slug")) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}
