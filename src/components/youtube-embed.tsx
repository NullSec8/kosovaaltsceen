"use client";

import { useMemo } from "react";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  try {
    const parsed = new URL(url);
    const v = parsed.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // not a valid URL
  }
  return null;
}

export function YouTubeEmbed({ url, bandName }: { url: string; bandName: string }) {
  const videoId = useMemo(() => extractYouTubeId(url), [url]);

  if (!videoId) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold uppercase tracking-wide">Watch</h2>
      <div className="relative w-full overflow-hidden border border-foreground/20" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={`${bandName} on YouTube`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  );
}
