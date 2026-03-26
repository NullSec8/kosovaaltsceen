import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kosovo Alt Scene is a community archive for the alternative music scene in Kosovo, created by nullsec8 for everyone who loves music.",
  openGraph: {
    title: "About | Kosovo Alt Scene",
    description:
      "A community-driven archive for Kosovo's alternative music, created by nullsec8 for the community and people who love music.",
  },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2 border-b border-foreground/20 pb-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">About</h1>
        <p className="text-sm uppercase tracking-wider text-foreground/70">Kosovo Alt Scene</p>
      </header>

      <section className="space-y-4 text-foreground/90 leading-relaxed">
        <p>
          Kosovo Alt Scene is a long-term digital archive documenting Kosovo&apos;s alternative music
          history—rock, metal, punk, indie, experimental—and the people who make it.
        </p>
        <p>
          This project was created by <strong className="text-foreground">nullsec8</strong> for the
          community and for everyone who loves music. It exists to preserve the memory and impact of
          the scene and to give bands a lasting place online.
        </p>
        <p>
          The archive is built to last: simple, open, and focused on the music and the stories
          behind it. If you want to contribute—new bands, corrections, or ideas—get in touch
          through the community or the channels you use to follow the scene.
        </p>
      </section>

      <section className="space-y-3 border-t border-foreground/20 pt-6">
        <h2 className="text-lg font-bold uppercase tracking-wide">Data we collect</h2>
        <p className="text-foreground/90 leading-relaxed">
          We only store data in your browser to make the site work and respect your choices:
        </p>
        <ul className="list-inside list-disc space-y-1 text-foreground/90">
          <li>
            <strong className="text-foreground">Theme</strong> — Your chosen colors (background, text, accent) so the site looks the same on your next visit.
          </li>
          <li>
            <strong className="text-foreground">Cookie choice</strong> — Whether you accepted &quot;Necessary only&quot; or &quot;Accept all&quot; so we don&apos;t ask again.
          </li>
          <li>
            <strong className="text-foreground">Visit (if you accepted all)</strong> — If you chose &quot;Accept all&quot;, we record your approximate country and IP address once per session to see where our visitors come from. We do not run other analytics or tracking.
          </li>
        </ul>
        <p className="text-foreground/90 leading-relaxed">
          Admin sign-in uses Supabase (email and session); we don&apos;t store your password. Suggesting a band is done by email (mailto) — we don&apos;t receive that data on our servers unless you send the email. You can change your cookie choice anytime via <strong className="text-foreground">Cookie settings</strong> in the footer.
        </p>
      </section>

      <section id="license" className="space-y-3 border-t border-foreground/20 pt-6">
        <h2 className="text-lg font-bold uppercase tracking-wide">License &amp; reuse</h2>
        <p className="text-foreground/90 leading-relaxed">
          The Kosovo Alt Scene archive is made for preservation and education. You may link to any page and quote short excerpts with attribution. If you reuse larger parts of the content (e.g. biographies, lists), please credit &quot;Kosovo Alt Scene&quot; and link back to this site. We do not claim rights over band names, lyrics, or third-party media; those remain with their respective owners.
        </p>
      </section>

      <section className="border-t border-foreground/20 pt-6">
        <h2 className="mb-3 text-lg font-bold uppercase tracking-wide">Explore</h2>
        <nav aria-label="Related links" className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="text-sm uppercase tracking-wider text-foreground/80 underline decoration-foreground/40 hover:text-accent"
          >
            Home
          </Link>
          <Link
            href="/bands"
            className="text-sm uppercase tracking-wider text-foreground/80 underline decoration-foreground/40 hover:text-accent"
          >
            Bands archive
          </Link>
          <Link
            href="/suggest"
            className="text-sm uppercase tracking-wider text-foreground/80 underline decoration-foreground/40 hover:text-accent"
          >
            Suggest a band
          </Link>
        </nav>
      </section>
    </article>
  );
}
