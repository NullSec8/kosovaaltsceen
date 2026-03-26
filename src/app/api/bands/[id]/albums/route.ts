import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { albumSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = albumSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const album = await prisma.album.create({
    data: {
      bandId: id,
      title: parsed.data.title,
      type: parsed.data.type ?? "ALBUM",
      releaseYear: parsed.data.releaseYear,
      coverImage: parsed.data.coverImage || null,
      description: parsed.data.description || null,
    },
  });

  return NextResponse.json({ album }, { status: 201 });
}
