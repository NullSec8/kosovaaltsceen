"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-4 border border-foreground/20 p-6 text-center">
      <h2 className="text-2xl font-extrabold uppercase tracking-wide">Something went wrong</h2>
      <p className="text-foreground/75">The archive is still safe. Retry your request.</p>
      <button
        onClick={reset}
        className="border border-foreground px-4 py-2 hover:border-accent hover:text-accent"
        aria-label="Retry loading the page"
      >
        Retry
      </button>
    </div>
  );
}
