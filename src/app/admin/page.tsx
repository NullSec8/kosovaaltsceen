import { redirect } from "next/navigation";

import type { AdminBand } from "@/components/admin/admin-dashboard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminAllowedEmails } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default async function AdminPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const allowed = getAdminAllowedEmails();
  if (allowed.length > 0) {
    const email = user.email?.trim().toLowerCase();
    if (!email || !allowed.includes(email)) {
      redirect("/login");
    }
  }

  const emptyVisitStats = { byCountry: {} as Record<string, number>, total: 0 };
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [bands, labels, visitStats, totalBands, recentBands, verifiedBands, pendingSuggestions] = await Promise.all([
    prisma.band
      .findMany({
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
          labelId: true,
          updatedAt: true,
          label: { select: { id: true, name: true, slug: true } },
        },
      })
      .catch(() => [] as Awaited<ReturnType<typeof prisma.band.findMany>>),
    (async () => {
      try {
        return await prisma.label.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        });
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        const rows = await prisma.visit.groupBy({
          by: ["country"],
          _count: { _all: true },
        });
        return {
          byCountry: rows.reduce(
            (acc, r) => {
              const key = r.country ?? "Unknown";
              acc[key] = r._count._all;
              return acc;
            },
            {} as Record<string, number>,
          ),
          total: rows.reduce((sum, r) => sum + r._count._all, 0),
        };
      } catch {
        return emptyVisitStats;
      }
    })(),
    prisma.band.count().catch(() => 0),
    prisma.band.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
    prisma.band.count({ where: { lastVerifiedAt: { gte: ninetyDaysAgo } } }).catch(() => 0),
    (async () => {
      if (typeof (prisma as { bandSuggestion?: { count: unknown } }).bandSuggestion?.count !== "function") {
        return 0;
      }
      try {
        return await prisma.bandSuggestion.count({ where: { status: "PENDING" } });
      } catch {
        return 0;
      }
    })(),
  ]);

  const serializedBands: AdminBand[] = bands.map((b) => {
    const { lastVerifiedAt, updatedAt, ...rest } = b;
    return {
      ...rest,
      lastVerifiedAt: lastVerifiedAt ? lastVerifiedAt.toISOString() : null,
      updatedAt: updatedAt.toISOString(),
      sources: (b.sources ?? null) as AdminBand["sources"],
    };
  });

  return (
    <AdminDashboard
      initialBands={serializedBands}
      initialLabels={labels}
      visitStats={visitStats}
      adminStats={{
        totalBands,
        recentBands,
        verifiedBands,
        pendingSuggestions,
      }}
    />
  );
}
