import Link from "next/link";

import { SearchAutocomplete } from "@/components/search-autocomplete";
import { BandCard } from "@/components/band-card";
import { GenreTagCloud } from "@/components/genre-tag-cloud";
import { RandomBandButton } from "@/components/random-band-button";
import { getHomepageData } from "@/lib/archive";

export const revalidate = 300;

export default async function HomePage() {
  const { featuredBands, recentBands, timeline, upcomingEvents, latestNews, genreTagCloud } = await getHomepageData();

  return (
    <div className="space-y-14">
      <section className="animate-fade-in-up border border-foreground/20 bg-background px-6 py-14">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/70">Digital Cultural Archive</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-tight tracking-wide md:text-5xl">
          Kosovo Alt Scene
        </h1>
        <p className="mt-5 max-w-2xl text-foreground/80">
          A long-term archival platform documenting Kosovo&apos;s alternative music history across rock,
          metal, punk, indie, and experimental movements.
        </p>
        <div className="mt-8 max-w-2xl">
          <SearchAutocomplete />
        </div>
      </section>

      <section className="animate-fade-in space-y-5 animate-delay-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold uppercase tracking-wide">Featured Bands</h2>
          <div className="flex items-center gap-3">
            <RandomBandButton />
            <Link
              href="/bands"
              className="inline-flex items-center gap-2 border border-foreground/40 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
            >
              View Full Archive
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuredBands.length > 0 ? (
            featuredBands.map((band, i) => (
              <div
                key={band.id}
                className="animate-fade-in opacity-0"
                style={{ animationDelay: `${300 + i * 80}ms` }}
              >
                <BandCard band={band} />
              </div>
            ))
          ) : (
            <p className="rounded border border-foreground/20 bg-foreground/5 px-4 py-6 text-foreground/70">
              No bands in the archive yet. Check back soon or explore the full archive.
            </p>
          )}
        </div>
      </section>

      <section className="animate-fade-in space-y-5 opacity-0 animate-delay-400">
        <h2 className="text-2xl font-extrabold uppercase tracking-wide">Recently Added</h2>
        <ul className="divide-y divide-foreground/15 border-y border-foreground/20">
          {recentBands.length > 0 ? (
            recentBands.map((band) => (
              <li key={band.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold uppercase tracking-wide">{band.name}</p>
                  <p className="text-sm text-foreground/70">
                    {band.city} • {band.yearFounded}
                  </p>
                </div>
                <Link href={`/bands/${band.slug}`} className="text-sm uppercase tracking-wider hover:text-accent">
                  Open Entry
                </Link>
              </li>
            ))
          ) : (
            <li className="py-4 text-foreground/70">No recent entries yet. The archive will grow over time.</li>
          )}
        </ul>
      </section>

      {upcomingEvents.length > 0 ? (
        <section className="animate-fade-in space-y-5 opacity-0 animate-delay-450">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide">Upcoming</h2>
            <Link href="/events" className="text-sm uppercase tracking-wider text-foreground/80 hover:text-accent">
              All events
            </Link>
          </div>
          <ul className="space-y-3">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="border border-foreground/20 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold uppercase tracking-wide">{event.title}</span>
                  <time dateTime={new Date(event.eventDate).toISOString()} className="text-sm text-foreground/70">
                    {new Date(event.eventDate).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="mt-1 text-foreground/80">{event.venue}</p>
                {event.lineup ? (
                  <p className="mt-1 text-sm text-foreground/70">Lineup: {event.lineup}</p>
                ) : null}
                {event.url ? (
                  <a href={event.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold uppercase tracking-wider hover:text-accent">
                    More info
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {latestNews.length > 0 ? (
        <section className="animate-fade-in space-y-5 opacity-0 animate-delay-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide">Scene news</h2>
            <Link href="/news" className="text-sm uppercase tracking-wider text-foreground/80 hover:text-accent">
              All news
            </Link>
          </div>
          <ul className="space-y-4">
            {latestNews.map((post) => (
              <li key={post.id} className="border border-foreground/20 p-4">
                <p className="text-sm text-foreground/70">
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-1 text-lg font-bold uppercase tracking-wide">
                  <Link href={`/news/${post.slug}`} className="hover:text-accent">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-foreground/85">{post.body.slice(0, 150)}{post.body.length > 150 ? "…" : ""}</p>
                <Link href={`/news/${post.slug}`} className="mt-2 inline-block text-sm font-semibold uppercase tracking-wider hover:text-accent">
                  Read more
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {genreTagCloud.length > 0 && (
        <div className="animate-fade-in opacity-0 animate-delay-500">
          <GenreTagCloud genres={genreTagCloud} />
        </div>
      )}

      <section className="animate-fade-in space-y-5 opacity-0 animate-delay-500">
        <h2 className="text-2xl font-extrabold uppercase tracking-wide">Timeline Preview</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {timeline.length > 0 ? (
            timeline.map((item) => (
              <article key={item.decade} className="border border-foreground/20 p-4">
                <p className="text-lg font-bold">{item.decade}s</p>
                <p className="text-sm text-foreground/70">{item.count} bands archived</p>
              </article>
            ))
          ) : (
            <p className="text-foreground/70">Decade timeline will appear here as more bands are added to the archive.</p>
          )}
        </div>
      </section>
    </div>
  );
}
