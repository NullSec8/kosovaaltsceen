import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getBandBySlug, getRelatedBands } from "@/lib/archive";
import { BandCard } from "@/components/band-card";
import { BandShare } from "@/components/band-share";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { buildBandMusicGroupJsonLd } from "@/lib/structured-data";

type BandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const band = await getBandBySlug(slug);

  if (!band) {
    return {
      title: "Band Not Found",
      description: "This archive record does not exist.",
    };
  }

  const firstImage = band.logoUrl ?? band.images[0]?.imageUrl;
  const bioMeta = band.biography.length > 137 ? `${band.biography.slice(0, 137)}...` : band.biography;
  const bioOg = band.biography.length > 177 ? `${band.biography.slice(0, 177)}...` : band.biography;

  return {
    title: band.name,
    description: `${band.name} • ${band.city} • Founded ${band.yearFounded}. ${bioMeta}`,
    openGraph: {
      title: `${band.name} | Kosovo Alt Scene`,
      description: bioOg,
      images: firstImage ? [{ url: firstImage }] : undefined,
      type: "article",
    },
    alternates: {
      canonical: `/bands/${band.slug}`,
    },
  };
}

export default async function BandPage({ params }: BandPageProps) {
  const { slug } = await params;
  const band = await getBandBySlug(slug);

  if (!band) {
    notFound();
  }

  const musicGroupJsonLd = buildBandMusicGroupJsonLd(band);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosovoaltscene.com";
  const shareUrl = `${siteUrl}/bands/${band.slug}`;

  const relatedBands = await getRelatedBands(band.slug, band.city, band.genres, 4);
  const releaseTypeLabel = (value?: string | null) => {
    switch (value) {
      case "EP":
        return "EP";
      case "SINGLE":
        return "Single";
      case "ALBUM":
      default:
        return "Album";
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: musicGroupJsonLd }}
      />
      <article className="space-y-10">
      <header className="animate-fade-in-up space-y-4 border-b border-foreground/20 pb-6">
        <Link href="/bands" className="text-sm uppercase tracking-wider text-foreground/70 hover:text-accent">
          ← Back to archive
        </Link>
        <div className="flex flex-wrap items-start gap-6">
          {band.logoUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded border border-foreground/20 bg-foreground/5 sm:h-32 sm:w-32">
              <Image
                src={band.logoUrl}
                alt={`${band.name} logo`}
                fill
                className="object-cover object-center"
                sizes="128px"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-black uppercase tracking-wide">{band.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-foreground/80">
          <span>{band.city}</span>
          <span>Founded {band.yearFounded}</span>
          <span>Status: {band.status.toLowerCase()}</span>
          {band.label ? (
            <span>
              <Link href={`/labels/${band.label.slug}`} className="hover:text-accent">
                {band.label.name}
              </Link>
            </span>
          ) : null}
        </div>
        <p className="text-foreground/85">{band.genres.join(" • ")}</p>
        <BandShare shareUrl={shareUrl} title={band.name} />
          </div>
        </div>
      </header>

      {(band.updatedAt || band.lastVerifiedAt) ? (
        <p className="text-sm text-foreground/70">
          {band.updatedAt ? (
            <>Last updated: {new Date(band.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
          ) : null}
          {band.updatedAt && band.lastVerifiedAt ? " · " : null}
          {band.lastVerifiedAt ? (
            <>Verified on: {new Date(band.lastVerifiedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
          ) : null}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-bold uppercase tracking-wide">Biography</h2>
        <p className="max-w-4xl leading-7 text-foreground/85">{band.biography}</p>
      </section>

      {band.youtubeUrl && <YouTubeEmbed url={band.youtubeUrl} bandName={band.name} />}

      <section className="space-y-3">
        <h2 className="text-xl font-bold uppercase tracking-wide">Members</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {band.members.length > 0 ? (
            band.members.map((member) => (
              <li key={member.id} className="border border-foreground/20 p-4">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-foreground/80">{member.role}</p>
                <p className="text-sm text-foreground/70">{member.yearsActive}</p>
              </li>
            ))
          ) : (
            <li className="text-foreground/70">No member records available.</li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold uppercase tracking-wide">Albums</h2>
        <ul className="space-y-3">
          {band.albums.length > 0 ? (
            band.albums.map((album) => (
              <li key={album.id} className="border border-foreground/20 p-4">
                <p className="font-semibold">
                  {album.title}{" "}
                  <span className="text-foreground/70">
                    ({releaseTypeLabel(album.type ?? null)} • {album.releaseYear})
                  </span>
                </p>
                {album.description ? <p className="mt-1 text-sm text-foreground/80">{album.description}</p> : null}
              </li>
            ))
          ) : (
            <li className="text-foreground/70">No album records available.</li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold uppercase tracking-wide">Gallery</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {band.images.length > 0 ? (
            band.images.map((image) => (
              <figure key={image.id} className="relative aspect-[4/3] w-full overflow-hidden border border-foreground/20 bg-foreground/5">
                <Image
                  src={image.imageUrl}
                  alt={image.caption ?? `${band.name} archive image`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {image.caption ? <figcaption className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-xs text-white/90">{image.caption}</figcaption> : null}
              </figure>
            ))
          ) : (
            <p className="text-foreground/70">No gallery items yet.</p>
          )}
        </div>
      </section>

      {relatedBands.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wide">
            More from {band.city}
            {band.genres.length > 0 ? ` / ${band.genres.slice(0, 2).join(", ")}` : ""}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {relatedBands.map((b) => (
              <BandCard key={b.id} band={b} />
            ))}
          </div>
        </section>
      ) : null}

      {band.sources && Array.isArray(band.sources) && band.sources.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-bold uppercase tracking-wide">Sources</h2>
          <ul className="space-y-2 text-sm">
            {(band.sources as { label: string; url: string }[]).map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-accent">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-wide">External Links</h2>
        <div className="flex flex-wrap gap-3">
          {band.youtubeUrl ? (
            <a
              href={band.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/30 px-5 py-3 text-base font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M23.5 6.19a3 3 0 0 0-2.11-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.39.56A3 3 0 0 0 .5 6.19 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.81 3 3 0 0 0 2.11 2.13c1.89.56 9.39.56 9.39.56s7.5 0 9.39-.56a3 3 0 0 0 2.11-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z"/></svg>
              YouTube
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          ) : null}
          {band.spotifyUrl ? (
            <a
              href={band.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/30 px-5 py-3 text-base font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34a.75.75 0 0 1-1.02.24c-2.82-1.72-6.36-2.1-10.54-1.16a.75.75 0 0 1-.34-1.46c4.56-1.04 8.5-.6 11.64 1.34a.75.75 0 0 1 .26 1.04zm1.46-3.28a.94.94 0 0 1-1.28.3c-3.22-1.98-8.14-2.56-11.94-1.4a.94.94 0 0 1-.54-1.8c4.34-1.32 9.74-.68 13.46 1.6a.94.94 0 0 1 .3 1.3zm.14-3.4C15.68 8.54 9.12 8.34 5.32 9.5a1.12 1.12 0 1 1-.66-2.14c4.34-1.34 11.56-1.08 16.12 1.64a1.12 1.12 0 0 1-1.66 1.66z"/></svg>
              Spotify
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          ) : null}
          {band.instagramUrl ? (
            <a
              href={band.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/30 px-5 py-3 text-base font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              Instagram
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          ) : null}
          {band.archivedUrl ? (
            <a
              href={band.archivedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-foreground/30 px-5 py-3 text-base font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
              Archive.org
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="opacity-50"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          ) : null}
          {!band.youtubeUrl && !band.spotifyUrl && !band.instagramUrl && !band.archivedUrl ? (
            <p className="text-foreground/70">No external links available.</p>
          ) : null}
        </div>
      </section>
    </article>
    </>
  );
}
