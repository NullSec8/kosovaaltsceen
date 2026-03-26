import { notFound, redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { AdminBandEditor } from "@/components/admin/admin-band-editor";
import type { AdminBandEditorBand } from "@/components/admin/admin-band-editor";
import { DEFAULT_GENRES } from "@/lib/genres";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminBandByIdPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBandByIdPage({ params }: AdminBandByIdPageProps) {
  unstable_noStore();
  const { id } = await params;
  const requestedId = id?.trim();
  if (!requestedId) {
    redirect("/admin");
  }

  const bandSelect = {
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
    labelId: true,
    albums: {
      orderBy: { releaseYear: "desc" as const },
      select: {
        id: true,
        title: true,
        type: true,
        releaseYear: true,
        coverImage: true,
        description: true,
      },
    },
  };

  const [band, labels, allBands, genreRows] = await Promise.all([
    prisma.band.findUnique({ where: { id: requestedId }, select: bandSelect }),
    prisma.label.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.band.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.band.findMany({ select: { genres: true } }),
  ]);

  if (!band) {
    notFound();
  }

  const serializedBand: AdminBandEditorBand = {
    ...band,
    lastVerifiedAt: band.lastVerifiedAt ? band.lastVerifiedAt.toISOString() : null,
    sources: (band.sources ?? null) as AdminBandEditorBand["sources"],
  };

  const availableGenres = Array.from(
    new Set([...DEFAULT_GENRES, ...genreRows.flatMap((item) => item.genres)]),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <AdminBandEditor
      key={serializedBand.id}
      band={serializedBand}
      labels={labels}
      allBands={allBands}
      availableGenres={availableGenres}
    />
  );
}
