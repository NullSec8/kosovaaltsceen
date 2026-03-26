import Link from "next/link";

import { ColorSettings } from "@/components/color-settings";
import { CookieSettingsLink } from "@/components/cookie-settings-link";
import { NewsletterSignup } from "@/components/newsletter-signup";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-foreground/20" role="contentinfo">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-foreground/80 md:px-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/" className="transition-colors hover:text-accent">Home</Link>
              <Link href="/bands" className="transition-colors hover:text-accent">Archive</Link>
              <Link href="/news" className="transition-colors hover:text-accent">News</Link>
              <Link href="/events" className="transition-colors hover:text-accent">Events</Link>
              <Link href="/labels" className="transition-colors hover:text-accent">Labels</Link>
              <Link href="/compare" className="transition-colors hover:text-accent">Compare</Link>
              <Link href="/about" className="transition-colors hover:text-accent">About</Link>
              <Link href="/about#license" className="transition-colors hover:text-accent">License</Link>
              <Link href="/suggest" className="transition-colors hover:text-accent">Suggest a band</Link>
              <ColorSettings />
              <CookieSettingsLink />
            </nav>
            <p>
              Kosovo Alt Scene is a long-term digital archive preserving the memory and impact of Kosovo&apos;s
              alternative music community.
            </p>
          </div>
          <NewsletterSignup />
        </div>
        <p>© {new Date().getFullYear()} Kosovo Alt Scene • Designed for archival longevity.</p>
      </div>
    </footer>
  );
}
