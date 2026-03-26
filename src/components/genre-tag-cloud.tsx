import Link from "next/link";

type GenreTag = { genre: string; count: number };

export function GenreTagCloud({ genres }: { genres: GenreTag[] }) {
  if (genres.length === 0) return null;

  const max = Math.max(...genres.map((g) => g.count));
  const min = Math.min(...genres.map((g) => g.count));
  const range = max - min || 1;

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold uppercase tracking-wide">Genres</h2>
      <div className="flex flex-wrap items-center justify-center gap-3 border border-foreground/20 bg-foreground/[0.02] p-6">
        {genres.map(({ genre, count }) => {
          const t = (count - min) / range;
          const size = 0.75 + t * 1.1;
          const opacity = 0.55 + t * 0.45;
          return (
            <Link
              key={genre}
              href={`/bands?genre=${encodeURIComponent(genre)}`}
              className="inline-block whitespace-nowrap transition-colors hover:text-accent"
              style={{ fontSize: `${size}rem`, opacity }}
              title={`${count} band${count !== 1 ? "s" : ""}`}
            >
              {genre}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
