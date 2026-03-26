import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getNewsPostBySlug } from "@/lib/archive";

const TYPE_LABELS: Record<string, string> = {
  NEW_BAND: "New band",
  REUNION: "Reunion",
  TRIBUTE: "Tribute",
  GENERAL: "News",
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) return { title: "News not found" };
  return {
    title: post.title,
    description: post.body.slice(0, 155) + (post.body.length > 155 ? "…" : ""),
  };
}

export default async function NewsPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/news" className="text-sm uppercase tracking-wider text-foreground/70 hover:text-accent">
          ← Scene news
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/70">
          <time dateTime={new Date(post.publishedAt).toISOString()}>
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{TYPE_LABELS[post.type] ?? post.type}</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide">{post.title}</h1>
      </header>

      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground/90">
        {post.body}
      </div>
    </article>
  );
}
