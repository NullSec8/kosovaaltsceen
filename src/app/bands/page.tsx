import { ArchiveFilters, Pagination } from "@/components/archive-filters";
import { BandCard } from "@/components/band-card";
import { RandomBandButton } from "@/components/random-band-button";
import type { BandSort } from "@/lib/archive";
import { getBandsArchive } from "@/lib/archive";
import { safeInt } from "@/lib/utils";

export const revalidate = 300;

type BandsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BandsPage({ searchParams }: BandsPageProps) {
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q : undefined;
  const genre = typeof params.genre === "string" ? params.genre : undefined;
  const city = typeof params.city === "string" ? params.city : undefined;
  const year = typeof params.year === "string" ? params.year : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const label = typeof params.label === "string" ? params.label : undefined;
  const sort: BandSort | undefined =
    typeof params.sort === "string" && ["name_asc", "year_desc", "year_asc", "recent"].includes(params.sort)
      ? (params.sort as BandSort)
      : undefined;
  const page = safeInt(typeof params.page === "string" ? params.page : undefined, 1);

  const result = await getBandsArchive({ q, genre, city, year, status, label, sort, page, perPage: 12 });

  return (
    <div className="space-y-6">
      <header className="animate-fade-in-up flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">Bands Archive</h1>
          <p className="text-foreground/70">Browse the documented history of Kosovo&apos;s alternative scene.</p>
        </div>
        <RandomBandButton />
      </header>

      <ArchiveFilters
        genres={result.genres}
        cities={result.cities}
        labels={result.labels}
        values={{ q, genre, city, year, status, label, sort: sort ?? "year_desc" }}
      />

      <p className="text-sm text-foreground/70">{result.totalCount} entries found</p>

      {result.bands.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.bands.map((band, i) => (
            <div
              key={band.id}
              className="animate-fade-in opacity-0"
              style={{ animationDelay: `${150 + i * 60}ms` }}
            >
              <BandCard band={band} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded border border-foreground/20 bg-foreground/5 p-6 text-foreground/70">
          No bands match the selected filters. Try changing or clearing filters, or browse from the home page.
        </p>
      )}

      <Pagination
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        basePath="/bands"
        query={{ q, genre, city, year, status, label, sort: sort ?? "year_desc" }}
      />
    </div>
  );
}
