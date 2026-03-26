"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Suggestion = { id: string; name: string; slug: string; city: string; genres: string[] };

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/30 text-foreground">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchAutocomplete({ defaultValue }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch(`/api/bands/search?q=${encodeURIComponent(q.trim())}&limit=8`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestions(data.bands ?? []);
      setOpen((data.bands ?? []).length > 0);
      setActiveIdx(-1);
    } catch {
      if (!ctrl.signal.aborted) {
        setSuggestions([]);
        setOpen(false);
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(query), 250);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      window.location.href = `/bands/${suggestions[activeIdx].slug}`;
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form action="/bands" method="get" className="flex w-full flex-col gap-3 sm:flex-row" role="search">
        <div className="relative w-full">
          <label htmlFor="search-bands" className="sr-only">Search bands</label>
          <input
            ref={inputRef}
            id="search-bands"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search bands, cities, or stories"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            className="w-full border border-foreground/30 bg-background px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-accent focus:outline-none"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground/50">…</span>
          )}
        </div>
        <button
          type="submit"
          className="border border-foreground px-5 py-3 font-semibold uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto border border-foreground/20 bg-background shadow-lg sm:right-auto sm:max-w-full"
        >
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={i === activeIdx}>
              <Link
                href={`/bands/${s.slug}`}
                className={`flex flex-col gap-0.5 px-4 py-3 transition ${
                  i === activeIdx ? "bg-foreground/10 text-accent" : "hover:bg-foreground/5"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="font-semibold">{highlightMatch(s.name, query)}</span>
                <span className="text-xs text-foreground/60">
                  {s.city} · {s.genres.slice(0, 3).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
