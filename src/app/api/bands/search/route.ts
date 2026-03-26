import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "8", 10), 20);

  if (q.length < 2) {
    return NextResponse.json({ bands: [] });
  }

  try {
    const bands = await prisma.band.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { genres: { hasSome: [q] } },
        ],
      },
      select: { id: true, name: true, slug: true, city: true, genres: true },
      take: limit,
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ bands });
  } catch {
    return NextResponse.json({ bands: [] });
  }
}
