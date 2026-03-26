const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kosovoaltscene.com";

type BandForStructuredData = {
  name: string;
  slug: string;
  city: string;
  yearFounded: number;
  genres: string[];
  biography: string;
  logoUrl?: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  instagramUrl: string | null;
  albums: { title: string; releaseYear: number; type?: string | null }[];
  members: { name: string; role: string }[];
  images: { imageUrl: string }[];
};

export function buildBandMusicGroupJsonLd(band: BandForStructuredData): string {
  const url = `${SITE_URL}/bands/${band.slug}`;
  const sameAs: string[] = [];
  if (band.youtubeUrl) sameAs.push(band.youtubeUrl);
  if (band.spotifyUrl) sameAs.push(band.spotifyUrl);
  if (band.instagramUrl) sameAs.push(band.instagramUrl);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": `${url}#musicgroup`,
    name: band.name,
    url,
    description: band.biography,
    genre: band.genres,
    foundingDate: band.yearFounded,
    ...((band.logoUrl || band.images.length > 0) && {
      image: band.logoUrl
        ? [band.logoUrl, ...band.images.map((img) => img.imageUrl)]
        : band.images.map((img) => img.imageUrl),
    }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(band.members.length > 0 && {
      member: band.members.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
      })),
    }),
    ...(band.albums.length > 0 && {
      album: band.albums.map((a) => ({
        "@type": "MusicAlbum",
        name: a.title,
        datePublished: a.releaseYear,
      })),
    }),
    ...(band.city && {
      location: {
        "@type": "Place",
        name: band.city,
      },
    }),
  };

  return JSON.stringify(schema);
}

export function buildSiteOrganizationJsonLd(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Kosovo Alt Scene",
    url: SITE_URL,
    description:
      "Kosovo Alt Scene is a long-term digital archive preserving alternative music history across rock, metal, punk, indie, and experimental bands from Kosovo. Created for the community and everyone who loves music.",
    logo: `${SITE_URL}/favicon.ico`,
  };

  return JSON.stringify(schema);
}
