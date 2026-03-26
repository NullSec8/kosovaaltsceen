import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { Prisma } from "@prisma/client";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { interviewSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
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
    const interview = await prisma.interview.update({
      where: { id },
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

    return NextResponse.json({ interview });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists. Choose a different slug." }, { status: 409 });
    }
    const raw = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: raw || "Could not update interview." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  await prisma.interview.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
