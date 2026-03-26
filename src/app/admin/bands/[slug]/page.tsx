import { notFound, redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { AdminBandEditor } from "@/components/admin/admin-band-editor";
import type { AdminBandEditorBand } from "@/components/admin/admin-band-editor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminBandPageProps = {
  params: { slug: string };
  searchParams?: { id?: string | string[] };
};

export default async function AdminBandPage({ params, searchParams }: AdminBandPageProps) {
  unstable_noStore();

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
  };

  const requestedId = Array.isArray(searchParams?.id) ? searchParams?.id[0] : searchParams?.id;

  const [band, labels, allBands] = await Promise.all([
    requestedId
      ? prisma.band.findUnique({ where: { id: requestedId }, select: bandSelect })
      : prisma.band.findFirst({ where: { slug: params.slug }, select: bandSelect }),
    prisma.label.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.band.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const resolvedBand = band
    ? band
    : await prisma.band.findFirst({ where: { slug: params.slug }, select: bandSelect });

  if (!resolvedBand) {
    notFound();
  }

  redirect(`/admin/bands/id/${resolvedBand.id}`);
}
