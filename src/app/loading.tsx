export default function Loading() {
  return (
    <div className="space-y-6 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-foreground/10" />
      <div className="h-4 w-80 animate-pulse rounded bg-foreground/10" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 border border-foreground/10 p-5">
            <div className="aspect-[4/3] w-full animate-pulse bg-foreground/5" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
