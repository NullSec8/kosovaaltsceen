import { BandStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type BandSort = "name_asc" | "year_desc" | "year_asc" | "recent";

export type BandFilters = {
  q?: string;
  genre?: string;
  city?: string;
  year?: string;
  status?: string;
  label?: string;
  sort?: BandSort;
  page?: number;
  perPage?: number;
};

export type ArchiveBand = {
  id: string;
  name: string;
  slug: string;
  city: string;
  yearFounded: number;
  status: BandStatus;
  genres: string[];
  biography: string;
  createdAt: Date;
  updatedAt: Date;
};

function buildBandWhere(filters: BandFilters): Prisma.BandWhereInput {
  const where: Prisma.BandWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { biography: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.genre) {
    where.genres = { has: filters.genre };
  }

  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }

  if (filters.year) {
    const year = Number.parseInt(filters.year, 10);
    if (Number.isFinite(year)) {
      where.yearFounded = year;
    }
  }

  if (filters.status && ["ACTIVE", "INACTIVE"].includes(filters.status)) {
    where.status = filters.status as BandStatus;
  }

  if (filters.label) {
    where.label = { slug: filters.label };
  }

  return where;
}

function getOrderBy(sort?: BandSort): Prisma.BandOrderByWithRelationInput[] {
  switch (sort) {
    case "name_asc":
      return [{ name: "asc" }];
    case "year_asc":
      return [{ yearFounded: "asc" }, { name: "asc" }];
    case "recent":
      return [{ createdAt: "desc" }, { name: "asc" }];
    case "year_desc":
    default:
      return [{ yearFounded: "desc" }, { name: "asc" }];
  }
}

export async function getHomepageData() {
  try {
    const [featuredBands, recentBands, years, upcomingEvents, latestNews, allBandGenres] = await Promise.all([
      prisma.band.findMany({
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        take: 4,
        include: {
          label: { select: { id: true, name: true, slug: true } },
          images: { take: 1, orderBy: { createdAt: "desc" }, select: { imageUrl: true } },
        },
      }),
      prisma.band.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          label: { select: { id: true, name: true, slug: true } },
          images: { take: 1, orderBy: { createdAt: "desc" }, select: { imageUrl: true } },
        },
      }),
      prisma.band.findMany({
        select: { yearFounded: true },
      }),
      prisma.event.findMany({
        where: { eventDate: { gte: new Date() } },
        orderBy: { eventDate: "asc" },
        take: 5,
      }),
      prisma.newsPost.findMany({
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.band.findMany({ select: { genres: true } }),
    ]);

    const genreCounts = new Map<string, number>();
    for (const band of allBandGenres) {
      for (const g of band.genres) {
        genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      }
    }
    const genreTagCloud = Array.from(genreCounts.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    const decadeMap = years.reduce<Record<number, number>>((acc, current) => {
      const decade = Math.floor(current.yearFounded / 10) * 10;
      acc[decade] = (acc[decade] ?? 0) + 1;
      return acc;
    }, {});

    const timeline = Object.entries(decadeMap)
      .map(([decade, count]) => ({
        decade: Number(decade),
        count,
      }))
      .sort((a, b) => a.decade - b.decade)
      .slice(-6);

    return { featuredBands, recentBands, timeline, upcomingEvents, latestNews, genreTagCloud };
  } catch {
    return { featuredBands: [], recentBands: [], timeline: [], upcomingEvents: [], latestNews: [], genreTagCloud: [] };
  }
}

export async function getBandsArchive(filters: BandFilters) {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  const where = buildBandWhere(filters);

  try {
    const orderBy = getOrderBy(filters.sort);

    const [bands, totalCount, allGenres, allCities, labels] = await Promise.all([
      prisma.band.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          label: { select: { id: true, name: true, slug: true } },
          images: { take: 1, orderBy: { createdAt: "desc" }, select: { imageUrl: true } },
        },
      }),
      prisma.band.count({ where }),
      prisma.band.findMany({ select: { genres: true } }),
      prisma.band.findMany({
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
      prisma.label.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    ]);

    const genres = Array.from(new Set(allGenres.flatMap((item) => item.genres))).sort((a, b) =>
      a.localeCompare(b),
    );

    return {
      bands,
      genres,
      cities: allCities.map((item) => item.city),
      labels,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalCount / perPage)),
      totalCount,
    };
  } catch {
    return {
      bands: [],
      genres: [],
      cities: [],
      labels: [],
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    };
  }
}

export async function getLabels() {
  try {
    return await prisma.label.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { bands: true } } },
    });
  } catch {
    return [];
  }
}

export async function getBandsByLabelSlug(slug: string) {
  try {
    return await prisma.band.findMany({
      where: { label: { slug } },
      orderBy: { name: "asc" },
      include: {
        label: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { createdAt: "desc" }, select: { imageUrl: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getLabelBySlug(slug: string) {
  try {
    return await prisma.label.findUnique({
      where: { slug },
      include: { _count: { select: { bands: true } } },
    });
  } catch {
    return null;
  }
}

export async function getUpcomingEvents(limit = 5) {
  try {
    return await prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getLatestNews(limit = 3) {
  try {
    return await prisma.newsPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getNewsPostBySlug(slug: string) {
  try {
    return await prisma.newsPost.findUnique({
      where: { slug },
    });
  } catch {
    return null;
  }
}

export async function getNewsPosts(page = 1, perPage = 10) {
  try {
    const [posts, total] = await Promise.all([
      prisma.newsPost.findMany({
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.newsPost.count(),
    ]);
    return { posts, total, totalPages: Math.max(1, Math.ceil(total / perPage)), currentPage: page };
  } catch {
    return { posts: [], total: 0, totalPages: 1, currentPage: 1 };
  }
}

export async function getEvents(upcomingFirst = true) {
  try {
    return await prisma.event.findMany({
      orderBy: { eventDate: upcomingFirst ? "asc" : "desc" },
    });
  } catch {
    return [];
  }
}

export async function getRandomBandSlug(): Promise<string | null> {
  try {
    const count = await prisma.band.count();
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    const bands = await prisma.band.findMany({
      take: 1,
      skip,
      orderBy: { id: "asc" },
      select: { slug: true },
    });
    return bands[0]?.slug ?? null;
  } catch {
    return null;
  }
}

export async function getBandBySlug(slug: string) {
  try {
    return await prisma.band.findUnique({
      where: { slug },
      include: {
        label: { select: { id: true, name: true, slug: true } },
        albums: {
          orderBy: { releaseYear: "desc" },
        },
        members: {
          orderBy: { name: "asc" },
        },
        images: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getRelatedBands(
  excludeSlug: string,
  city: string,
  genres: string[],
  limit = 4,
) {
  try {
    const bands = await prisma.band.findMany({
      where: {
        slug: { not: excludeSlug },
        OR: [
          { city: { equals: city, mode: "insensitive" } },
          ...(genres.length > 0
            ? genres.map((g) => ({ genres: { has: g } }))
            : [{ id: { not: "impossible" } }]),
        ],
      },
      orderBy: { name: "asc" },
      take: limit,
      include: {
        images: { take: 1, orderBy: { createdAt: "desc" }, select: { imageUrl: true } },
      },
    });
    return bands;
  } catch {
    return [];
  }
}
