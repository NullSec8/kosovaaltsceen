import Link from "next/link";

import { getEvents } from "@/lib/archive";

export const revalidate = 300;

export const metadata = {
  title: "Events & gigs",
  description: "Past and upcoming shows and events from the Kosovo alternative music scene.",
};

export default async function EventsPage() {
  const events = await getEvents(true);
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.eventDate) >= now);
  const past = events.filter((e) => new Date(e.eventDate) < now).reverse();

  return (
    <div className="space-y-10">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-wide">Events &amp; gigs</h1>
            <p className="mt-2 text-foreground/70">
              Past and upcoming shows from the Kosovo alternative music scene.
            </p>
          </div>
        </div>
      </header>

      {upcoming.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wide">Upcoming</h2>
          <ul className="space-y-4">
            {upcoming.map((event) => (
              <li key={event.id} className="border border-foreground/20 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold uppercase tracking-wide">{event.title}</h3>
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
                  <p className="mt-2 text-sm text-foreground/70">Lineup: {event.lineup}</p>
                ) : null}
                {event.description ? (
                  <p className="mt-2 text-foreground/85">{event.description}</p>
                ) : null}
                {event.url ? (
                  <a href={event.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold uppercase tracking-wider hover:text-accent">
                    Tickets / more info
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wide">Past</h2>
          <ul className="space-y-4">
            {past.map((event) => (
              <li key={event.id} className="border border-foreground/15 p-4 opacity-90">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold uppercase tracking-wide">{event.title}</h3>
                  <time dateTime={new Date(event.eventDate).toISOString()} className="text-sm text-foreground/70">
                    {new Date(event.eventDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <p className="mt-1 text-foreground/80">{event.venue}</p>
                {event.lineup ? (
                  <p className="mt-2 text-sm text-foreground/70">Lineup: {event.lineup}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {events.length === 0 ? (
        <p className="rounded border border-foreground/20 bg-foreground/5 p-6 text-foreground/70">
          No events listed yet. Check back later or explore the archive.
        </p>
      ) : null}
    </div>
  );
}
