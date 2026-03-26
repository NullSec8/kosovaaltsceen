import Link from "next/link";

type LabelOption = { id: string; name: string; slug: string };

type ArchiveFiltersProps = {
  genres: string[];
  cities: string[];
  labels: LabelOption[];
  values: {
    q?: string;
    genre?: string;
    city?: string;
    year?: string;
    status?: string;
    label?: string;
    sort?: string;
  };
};

export function ArchiveFilters({ genres, cities, labels, values }: ArchiveFiltersProps) {
  return (
    <form action="/bands" method="get" className="grid gap-3 border border-foreground/20 p-4 md:grid-cols-6" role="search" aria-label="Filter bands archive">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-search" className="text-xs uppercase tracking-wider text-foreground/70">
          Search
        </label>
        <input
          id="filter-search"
          name="q"
          defaultValue={values.q}
          placeholder="Bands, cities, stories…"
          className="border border-foreground/30 bg-background px-3 py-2 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
          aria-label="Search bands by name or biography"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-genre" className="text-xs uppercase tracking-wider text-foreground/70">
          Genre
        </label>
        <select id="filter-genre" name="genre" defaultValue={values.genre ?? ""} className="border border-foreground/30 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none">
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option value={genre} key={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-city" className="text-xs uppercase tracking-wider text-foreground/70">
          City
        </label>
        <select id="filter-city" name="city" defaultValue={values.city ?? ""} className="border border-foreground/30 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none">
          <option value="">All cities</option>
          {cities.map((city) => (
            <option value={city} key={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-year" className="text-xs uppercase tracking-wider text-foreground/70">
          Year founded
        </label>
        <input
          id="filter-year"
          name="year"
          defaultValue={values.year}
          placeholder="e.g. 1995"
          className="border border-foreground/30 bg-background px-3 py-2 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
          type="number"
          min={1900}
          max={2100}
          aria-label="Filter by year band was founded"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-status" className="text-xs uppercase tracking-wider text-foreground/70">
          Status
        </label>
        <select id="filter-status" name="status" defaultValue={values.status ?? ""} className="border border-foreground/30 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-label" className="text-xs uppercase tracking-wider text-foreground/70">
          Label
        </label>
        <select id="filter-label" name="label" defaultValue={values.label ?? ""} className="border border-foreground/30 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none">
          <option value="">All labels</option>
          {labels.map((l) => (
            <option value={l.slug} key={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-sort" className="text-xs uppercase tracking-wider text-foreground/70">
          Sort by
        </label>
        <select id="filter-sort" name="sort" defaultValue={values.sort ?? "year_desc"} className="border border-foreground/30 bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none">
          <option value="year_desc">Year (newest first)</option>
          <option value="year_asc">Year (oldest first)</option>
          <option value="name_asc">Name A–Z</option>
          <option value="recent">Recently added</option>
        </select>
      </div>

      <div className="md:col-span-6 flex items-center gap-2">
        <button
          type="submit"
          className="border border-foreground px-4 py-2 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          Apply Filters
        </button>
        <Link
          href="/bands"
          className="border border-foreground/40 px-4 py-2 text-sm uppercase tracking-wider text-foreground/80 transition hover:text-accent"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

function buildUrl(basePath: string, query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({ currentPage, totalPages, basePath, query }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-8 flex items-center justify-between border-t border-foreground/20 pt-6" aria-label="Pagination">
      {currentPage > 1 ? (
        <a
          href={buildUrl(basePath, query, currentPage - 1)}
          className="inline-flex items-center gap-2 border border-foreground/40 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </a>
      ) : (
        <span className="inline-flex items-center gap-2 border border-foreground/15 px-5 py-3 text-sm uppercase tracking-wider text-foreground/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6"/></svg>
          Previous
        </span>
      )}

      <span className="text-sm text-foreground/70">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <a
          href={buildUrl(basePath, query, currentPage + 1)}
          className="inline-flex items-center gap-2 border border-foreground/40 px-5 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      ) : (
        <span className="inline-flex items-center gap-2 border border-foreground/15 px-5 py-3 text-sm uppercase tracking-wider text-foreground/30">
          Next
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      )}
    </nav>
  );
}
