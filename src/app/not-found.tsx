import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-6 border border-foreground/20 p-8 text-center">
      <h1 className="text-3xl font-extrabold uppercase tracking-wide">Page not found</h1>
      <p className="text-foreground/80">
        This page doesn&apos;t exist or may have been moved. Here are some ways to get back on track.
      </p>
      <nav aria-label="404 recovery links" className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-block border border-foreground px-4 py-2 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          Home
        </Link>
        <Link
          href="/bands"
          className="inline-block border border-foreground px-4 py-2 text-sm font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          Archive
        </Link>
        <Link
          href="/bands/random"
          className="inline-block border border-foreground/60 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-foreground/90 transition hover:border-accent hover:text-accent"
        >
          Random band
        </Link>
      </nav>
    </div>
  );
}
