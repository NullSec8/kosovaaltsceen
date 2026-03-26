import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosovoaltscene.com";

  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/bands`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/suggest`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/labels`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  if (!process.env.DATABASE_URL) {
    return baseRoutes;
  }

  try {
    const [bands, labels, newsPosts] = await Promise.all([
      prisma.band.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.label.findMany({ select: { slug: true } }),
      prisma.newsPost.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const bandRoutes: MetadataRoute.Sitemap = bands.map((band) => ({
      url: `${baseUrl}/bands/${band.slug}`,
      lastModified: band.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const labelRoutes: MetadataRoute.Sitemap = labels.map((label) => ({
      url: `${baseUrl}/labels/${label.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const newsRoutes: MetadataRoute.Sitemap = newsPosts.map((post) => ({
      url: `${baseUrl}/news/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...baseRoutes, ...bandRoutes, ...labelRoutes, ...newsRoutes];
  } catch {
    // Keep deployments healthy when database credentials are unavailable at build time.
    return baseRoutes;
  }
}
