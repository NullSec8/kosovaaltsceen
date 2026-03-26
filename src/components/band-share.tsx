"use client";

import { useState } from "react";

type BandShareProps = {
  shareUrl: string;
  title: string;
};

export function BandShare({ shareUrl, title }: BandShareProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${title} | Kosovo Alt Scene`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="flex flex-wrap items-center gap-3" aria-label="Share this band">
      <span className="text-sm uppercase tracking-wider text-foreground/70">Share</span>
      <button
        type="button"
        onClick={handleCopyLink}
        className="border border-foreground/40 px-3 py-1.5 text-sm uppercase tracking-wider transition hover:border-accent hover:text-accent"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-foreground/40 px-3 py-1.5 text-sm uppercase tracking-wider transition hover:border-accent hover:text-accent"
      >
        Twitter
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-foreground/40 px-3 py-1.5 text-sm uppercase tracking-wider transition hover:border-accent hover:text-accent"
      >
        Facebook
      </a>
    </section>
  );
}
