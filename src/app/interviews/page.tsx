import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "Interviews | Kosovo Alt Scene",
  description: "Band interviews from Kosovo Alt Scene. Read conversations with bands across the alternative scene.",
};

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type InterviewsPageProps = {
  searchParams?: { page?: string };
};

export default async function InterviewsPage({ searchParams }: InterviewsPageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      orderBy: { dateCreated: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        dateCreated: true,
        band: { select: { name: true, slug: true } },
      },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.interview.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Interviews</h1>
        <p className="text-sm text-white/70">Conversations with bands from the Kosovo alternative scene.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {interviews.map((interview) => (
          <article
            key={interview.id}
            className="overflow-hidden border border-white/15 bg-black shadow-sm transition hover:border-accent hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">
              {interview.featuredImage ? (
                <Image src={interview.featuredImage} alt={interview.title} fill className="object-cover" />
              ) : null}
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs uppercase tracking-wider text-white/60">{formatDate(interview.dateCreated)}</p>
              <h2 className="text-lg font-semibold">{interview.title}</h2>
              <Link href={`/bands/${interview.band.slug}`} className="text-sm text-white/70 hover:text-accent">
                {interview.band.name}
              </Link>
              <div>
                <Link href={`/interviews/${interview.slug}`} className="text-sm font-semibold text-accent hover:underline">
                  Read more
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-2 text-sm">
          <Link
            href={`/interviews?page=${Math.max(1, page - 1)}`}
            className="border border-white/40 px-3 py-2 hover:border-accent hover:text-accent"
          >
            Previous
          </Link>
          <span className="text-white/60">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/interviews?page=${Math.min(totalPages, page + 1)}`}
            className="border border-white/40 px-3 py-2 hover:border-accent hover:text-accent"
          >
            Next
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
