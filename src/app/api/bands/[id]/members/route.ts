import { NextRequest, NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validators";

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
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const member = await prisma.member.create({
    data: {
      bandId: id,
      name: parsed.data.name,
      role: parsed.data.role,
      yearsActive: parsed.data.yearsActive,
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
