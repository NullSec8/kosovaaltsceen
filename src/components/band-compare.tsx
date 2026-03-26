"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type CompareBand = {
  id: string;
  name: string;
  slug: string;
  city: string;
  yearFounded: number;
  status: string;
  genres: string[];
  logoUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  label: { name: string; slug: string } | null;
  members: { id: string; name: string; role: string }[];
  albums: { id: string; title: string; releaseYear: number; type: string | null }[];
  _count: { images: number; albums: number; members: number };
};

type SearchResult = { id: string; name: string; slug: string; city: string; genres: string[] };

function BandSelector({
  label,
  selected,
  onSelect,
  excludeSlug,
}: {
  label: string;
  selected: CompareBand | null;
  onSelect: (slug: string) => void;
  excludeSlug?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/bands/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        const filtered = (data.bands ?? []).filter((b: SearchResult) => b.slug !== excludeSlug);
        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, excludeSlug]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-wider text-foreground/60">{label}:</span>
        <span className="font-bold">{selected.name}</span>
        <button
          onClick={() => { onSelect(""); setQuery(""); }}
          className="text-xs uppercase tracking-wider text-foreground/50 hover:text-accent"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="text-sm font-semibold uppercase tracking-wider text-foreground/60">{label}</span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        placeholder="Type to search…"
        className="mt-1 w-full border border-foreground/30 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
      />
      {open && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto border border-foreground/20 bg-background shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <button
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-foreground/5"
                onClick={() => { onSelect(r.slug); setQuery(""); setOpen(false); }}
              >
                <span className="font-semibold">{r.name}</span>
                <span className="text-xs text-foreground/60">{r.city}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatRow({ label, left, right }: { label: string; left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 border-b border-foreground/10 py-3 last:border-0">
      <div className="text-right text-sm">{left}</div>
      <div className="w-24 text-center text-xs font-semibold uppercase tracking-wider text-foreground/50">{label}</div>
      <div className="text-sm">{right}</div>
    </div>
  );
}

export function BandCompare() {
  const [bandA, setBandA] = useState<CompareBand | null>(null);
  const [bandB, setBandB] = useState<CompareBand | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchComparison = useCallback(async (slugA: string, slugB: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bands/compare?slugs=${slugA},${slugB}`);
      const data = await res.json();
      if (data.bands?.length === 2) {
        setBandA(data.bands.find((b: CompareBand) => b.slug === slugA) ?? data.bands[0]);
        setBandB(data.bands.find((b: CompareBand) => b.slug === slugB) ?? data.bands[1]);
      }
    } catch { /* handled by empty state */ }
    setLoading(false);
  }, []);

  const [slugA, setSlugA] = useState("");
  const [slugB, setSlugB] = useState("");

  useEffect(() => {
    if (slugA && slugB) fetchComparison(slugA, slugB);
  }, [slugA, slugB, fetchComparison]);

  const handleSelectA = (slug: string) => {
    if (!slug) { setBandA(null); setSlugA(""); return; }
    setSlugA(slug);
  };
  const handleSelectB = (slug: string) => {
    if (!slug) { setBandB(null); setSlugB(""); return; }
    setSlugB(slug);
  };

  const ready = bandA && bandB;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <BandSelector label="Band A" selected={bandA} onSelect={handleSelectA} excludeSlug={slugB} />
        <BandSelector label="Band B" selected={bandB} onSelect={handleSelectB} excludeSlug={slugA} />
      </div>

      {loading && <p className="text-center text-sm text-foreground/60">Loading comparison…</p>}

      {ready && (
        <div className="space-y-1 border border-foreground/20 p-4 sm:p-6">
          <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-end gap-2">
              {bandA.logoUrl && (
                <div className="relative h-16 w-16 overflow-hidden rounded border border-foreground/20 bg-foreground/5">
                  <Image src={bandA.logoUrl} alt={bandA.name} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <Link href={`/bands/${bandA.slug}`} className="text-lg font-black uppercase tracking-wide hover:text-accent">{bandA.name}</Link>
            </div>
            <span className="text-xl font-extrabold text-foreground/30">VS</span>
            <div className="flex flex-col items-start gap-2">
              {bandB.logoUrl && (
                <div className="relative h-16 w-16 overflow-hidden rounded border border-foreground/20 bg-foreground/5">
                  <Image src={bandB.logoUrl} alt={bandB.name} fill className="object-cover" sizes="64px" />
                </div>
              )}
              <Link href={`/bands/${bandB.slug}`} className="text-lg font-black uppercase tracking-wide hover:text-accent">{bandB.name}</Link>
            </div>
          </div>

          <StatRow label="City" left={bandA.city} right={bandB.city} />
          <StatRow label="Founded" left={bandA.yearFounded} right={bandB.yearFounded} />
          <StatRow label="Status" left={bandA.status.toLowerCase()} right={bandB.status.toLowerCase()} />
          <StatRow label="Genres" left={bandA.genres.join(", ")} right={bandB.genres.join(", ")} />
          <StatRow label="Label" left={bandA.label?.name ?? "—"} right={bandB.label?.name ?? "—"} />
          <StatRow label="Members" left={bandA._count.members} right={bandB._count.members} />
          <StatRow label="Albums" left={bandA._count.albums} right={bandB._count.albums} />
          <StatRow label="Photos" left={bandA._count.images} right={bandB._count.images} />

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground/60">Members of {bandA.name}</h3>
              <ul className="space-y-1 text-sm">
                {bandA.members.length > 0 ? bandA.members.map((m) => (
                  <li key={m.id}>{m.name} <span className="text-foreground/60">({m.role})</span></li>
                )) : <li className="text-foreground/50">No data</li>}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground/60">Members of {bandB.name}</h3>
              <ul className="space-y-1 text-sm">
                {bandB.members.length > 0 ? bandB.members.map((m) => (
                  <li key={m.id}>{m.name} <span className="text-foreground/60">({m.role})</span></li>
                )) : <li className="text-foreground/50">No data</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
