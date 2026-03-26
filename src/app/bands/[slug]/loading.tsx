export default function BandLoading() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="space-y-4 border-b border-white/20 pb-6">
        <div className="h-4 w-32 rounded bg-white/20" />
        <div className="h-10 w-72 max-w-full rounded bg-white/20" />
        <div className="flex gap-4">
          <div className="h-4 w-24 rounded bg-white/20" />
          <div className="h-4 w-28 rounded bg-white/20" />
          <div className="h-4 w-20 rounded bg-white/20" />
        </div>
        <div className="h-4 w-48 rounded bg-white/20" />
      </div>

      <section className="space-y-3">
        <div className="h-6 w-32 rounded bg-white/20" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-white/20" />
          <div className="h-4 w-full rounded bg-white/20" />
          <div className="h-4 max-w-[80%] rounded bg-white/20" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="h-6 w-24 rounded bg-white/20" />
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded border border-white/20 bg-white/5" />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="h-6 w-20 rounded bg-white/20" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded border border-white/20 bg-white/5" />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="h-6 w-16 rounded bg-white/20" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded border border-white/20 bg-white/5" />
          ))}
        </div>
      </section>
    </div>
  );
}
