import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { DEFAULT_GENRES } from "@/lib/genres";
import { prisma } from "@/lib/prisma";
import { bandSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeGenre(value: string) {
  return value.trim().toLowerCase();
}

async function getAllowedGenres() {
  const rows = await prisma.band.findMany({ select: { genres: true } });
  return Array.from(new Set([...DEFAULT_GENRES, ...rows.flatMap((item) => item.genres)])).sort((a, b) =>
    a.localeCompare(b),
  );
}

function normalizeGenres(input: string[], allowed: string[]) {
  if (allowed.length === 0) {
    return { normalizedGenres: input.map((g) => g.trim()).filter(Boolean), invalidGenres: [] as string[] };
  }

  const allowedMap = new Map(allowed.map((genre) => [normalizeGenre(genre), genre]));
  const normalized: string[] = [];
  const invalid: string[] = [];

  input.forEach((raw) => {
    const key = normalizeGenre(raw);
    if (!key) return;
    const match = allowedMap.get(key);
    if (match) {
      if (!normalized.includes(match)) normalized.push(match);
    } else {
      invalid.push(raw);
    }
  });

  return { normalizedGenres: normalized, invalidGenres: invalid };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = bandSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allowedGenres = await getAllowedGenres();
  const { normalizedGenres, invalidGenres } = normalizeGenres(parsed.data.genres, allowedGenres);
  if (invalidGenres.length > 0) {
    return NextResponse.json({ error: `Unknown genres: ${invalidGenres.join(", ")}` }, { status: 400 });
  }

  const slug =
    parsed.data.slug && parsed.data.slug.length > 1
      ? slugify(parsed.data.slug, { lower: true, strict: true, trim: true })
      : slugify(parsed.data.name, { lower: true, strict: true, trim: true });

  const { lastVerifiedAt, archivedUrl, sources, labelId, ...rest } = parsed.data;

  try {
    const band = await prisma.band.update({
      where: { id },
      data: {
        ...rest,
        genres: normalizedGenres,
        slug,
        logoUrl: parsed.data.logoUrl || null,
        youtubeUrl: parsed.data.youtubeUrl || null,
        spotifyUrl: parsed.data.spotifyUrl || null,
        instagramUrl: parsed.data.instagramUrl || null,
        lastVerifiedAt: lastVerifiedAt ?? null,
        archivedUrl: archivedUrl && archivedUrl.trim() ? archivedUrl.trim() : null,
        sources: sources && sources.length > 0 ? sources : Prisma.JsonNull,
        labelId: labelId && labelId.trim() ? labelId.trim() : null,
      },
    });

    return NextResponse.json({ band });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists. Choose a different slug." }, { status: 409 });
    }
    const raw = err instanceof Error ? err.message : "";
    return NextResponse.json({ error: raw || "Database error." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  await prisma.band.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
