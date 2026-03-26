import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { interviewSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { dateCreated: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        featuredImage: true,
        dateCreated: true,
        band: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json({ interviews });
  } catch {
    return NextResponse.json({ interviews: [] });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const body = await request.json();
  const parsed = interviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 1
      ? slugify(parsed.data.slug, { lower: true, strict: true, trim: true })
      : slugify(parsed.data.title, { lower: true, strict: true, trim: true });

  try {
    const interview = await prisma.interview.create({
      data: {
        title: parsed.data.title,
        slug,
        content: parsed.data.content,
        featuredImage: parsed.data.featuredImage,
        dateCreated: parsed.data.dateCreated ?? undefined,
        bandId: parsed.data.bandId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        dateCreated: true,
        band: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: raw || "Could not create interview." }, { status: 500 });
  }
}
