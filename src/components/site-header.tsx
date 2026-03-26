import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();

  return (
    <header className="border-b border-foreground/20">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <Link href="/" className="text-lg font-extrabold uppercase tracking-[0.2em] transition-colors hover:text-accent">
          Kosovo Alt Scene
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm uppercase tracking-wider md:flex">
          <Link href="/bands" className="transition-colors hover:text-accent">
            Archive
          </Link>
          <Link href="/news" className="transition-colors hover:text-accent">
            News
          </Link>
          <Link href="/events" className="transition-colors hover:text-accent">
            Events
          </Link>
          <Link href="/labels" className="transition-colors hover:text-accent">
            Labels
          </Link>
          <Link href="/compare" className="transition-colors hover:text-accent">
            Compare
          </Link>
          <Link href="/about" className="transition-colors hover:text-accent">
            About
          </Link>
          {user ? (
            <Link href="/admin" className="transition-colors hover:text-accent">
              Admin
            </Link>
          ) : null}
        </nav>
        <MobileNav showAdmin={!!user} />
      </div>
    </header>
  );
}
