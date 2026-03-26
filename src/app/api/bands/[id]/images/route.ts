import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { imageSchema } from "@/lib/validators";

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
  const parsed = imageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const image = await prisma.image.create({
    data: {
      bandId: id,
      imageUrl: parsed.data.imageUrl,
      caption: parsed.data.caption || null,
    },
  });

  return NextResponse.json({ image }, { status: 201 });
}
