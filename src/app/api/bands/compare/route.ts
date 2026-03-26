import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get("slugs")?.split(",").map((s) => s.trim()).filter(Boolean);

  if (!slugs || slugs.length !== 2) {
    return NextResponse.json({ error: "Provide exactly 2 comma-separated slugs." }, { status: 400 });
  }

  try {
    const bands = await prisma.band.findMany({
      where: { slug: { in: slugs } },
      include: {
        members: { select: { id: true, name: true, role: true } },
        albums: { select: { id: true, title: true, releaseYear: true, type: true } },
        label: { select: { name: true, slug: true } },
        _count: { select: { images: true, albums: true, members: true } },
      },
    });

    if (bands.length !== 2) {
      return NextResponse.json({ error: "One or both bands not found." }, { status: 404 });
    }

    return NextResponse.json({ bands });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bands." }, { status: 500 });
  }
}
