import Link from "next/link";

import { getNewsPosts } from "@/lib/archive";

export const revalidate = 300;

export const metadata = {
  title: "Scene news",
  description: "News, reunions, tributes, and updates from the Kosovo alternative music scene.",
};

const TYPE_LABELS: Record<string, string> = {
  NEW_BAND: "New band",
  REUNION: "Reunion",
  TRIBUTE: "Tribute",
  GENERAL: "News",
};

export default async function NewsPage() {
  const { posts, totalPages, currentPage } = await getNewsPosts(1, 15);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Scene news</h1>
        <p className="mt-2 text-foreground/70">
          New bands, reunions, tributes, and updates from the Kosovo alternative music scene.
        </p>
      </header>

      {posts.length > 0 ? (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="border border-foreground/20 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/70">
                  <time dateTime={new Date(post.publishedAt).toISOString()}>
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{TYPE_LABELS[post.type] ?? post.type}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold uppercase tracking-wide">
                  <Link href={`/news/${post.slug}`} className="hover:text-accent">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-foreground/85">{post.body.slice(0, 200)}{post.body.length > 200 ? "…" : ""}</p>
                <Link href={`/news/${post.slug}`} className="mt-2 inline-block text-sm font-semibold uppercase tracking-wider hover:text-accent">
                  Read more
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded border border-foreground/20 bg-foreground/5 p-6 text-foreground/70">
          No news posts yet. Check back later or explore the archive.
        </p>
      )}
    </div>
  );
}
