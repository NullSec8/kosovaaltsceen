import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { requireAuthenticatedUser } from "@/lib/api-auth";
import { DEFAULT_GENRES } from "@/lib/genres";
import { prisma } from "@/lib/prisma";
import { bandSchema } from "@/lib/validators";

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

export async function GET() {
  const bands = await prisma.band.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      yearFounded: true,
      status: true,
      genres: true,
      biography: true,
      logoUrl: true,
      youtubeUrl: true,
      spotifyUrl: true,
      instagramUrl: true,
      lastVerifiedAt: true,
      archivedUrl: true,
      sources: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ bands });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

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

  try {
    const { lastVerifiedAt, archivedUrl, sources, labelId, ...rest } = parsed.data;
    const band = await prisma.band.create({
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

    return NextResponse.json({ band }, { status: 201 });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    const message =
      raw.includes("DATABASE_URL") || raw.includes("Environment variable")
        ? "Database is not configured. Add DATABASE_URL (and DIRECT_URL) to .env and restart the dev server."
        : raw.length > 200
          ? "Database error. Check .env and that the database is running."
          : raw || "Database error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
