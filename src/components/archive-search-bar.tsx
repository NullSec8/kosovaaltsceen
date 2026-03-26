type ArchiveSearchBarProps = {
  defaultValue?: string;
};

export function ArchiveSearchBar({ defaultValue }: ArchiveSearchBarProps) {
  return (
    <form action="/bands" method="get" className="flex w-full flex-col gap-3 sm:flex-row" role="search">
      <label htmlFor="search-bands" className="sr-only">
        Search bands
      </label>
      <input
        id="search-bands"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search bands, cities, or stories"
        className="w-full border border-foreground/30 bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        className="border border-foreground px-5 py-3 font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
      >
        Search
      </button>
    </form>
  );
}
