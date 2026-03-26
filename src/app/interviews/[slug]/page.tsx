import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InterviewShare } from "@/components/interview-share";
import { prisma } from "@/lib/prisma";

type InterviewPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: InterviewPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return {
      title: "Interview Not Found | Kosovo Alt Scene",
      description: "The requested interview could not be found.",
    };
  }

  const interview = await prisma.interview.findUnique({
    where: { slug },
    select: {
      title: true,
      band: { select: { name: true } },
    },
  });

  if (!interview) {
    return {
      title: "Interview Not Found | Kosovo Alt Scene",
      description: "The requested interview could not be found.",
    };
  }

  return {
    title: `${interview.title} | Kosovo Alt Scene`,
    description: `Interview with ${interview.band.name} on Kosovo Alt Scene.`,
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const interview = await prisma.interview.findUnique({
    where: { slug },
    select: {
      title: true,
      content: true,
      featuredImage: true,
      dateCreated: true,
      band: { select: { name: true, slug: true } },
    },
  });

  if (!interview) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-white/60">{formatDate(interview.dateCreated)}</p>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">{interview.title}</h1>
        <Link href={`/bands/${interview.band.slug}`} className="text-sm text-white/70 hover:text-accent">
          {interview.band.name}
        </Link>
      </header>

      {interview.featuredImage ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/15 bg-white/5">
          <Image src={interview.featuredImage} alt={interview.title} fill className="object-cover" />
        </div>
      ) : null}

      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: interview.content }} />

      <InterviewShare title={interview.title} />
    </article>
  );
}
