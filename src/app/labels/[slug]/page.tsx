import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getBandsByLabelSlug, getLabelBySlug } from "@/lib/archive";
import { BandCard } from "@/components/band-card";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = await getLabelBySlug(slug);
  if (!label) return { title: "Label not found" };
  return {
    title: label.name,
    description: `Bands on ${label.name} in the Kosovo Alt Scene archive.`,
  };
}

export default async function LabelPage({ params }: PageProps) {
  const { slug } = await params;
  const [label, bands] = await Promise.all([getLabelBySlug(slug), getBandsByLabelSlug(slug)]);

  if (!label) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/labels" className="text-sm uppercase tracking-wider text-foreground/70 hover:text-accent">
          ← All labels
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide">{label.name}</h1>
        <p className="text-foreground/70">{label._count.bands} band(s) in the archive</p>
      </header>

      {bands.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bands.map((band) => (
            <BandCard key={band.id} band={band} />
          ))}
        </div>
      ) : (
        <p className="text-foreground/70">No bands linked to this label.</p>
      )}
    </div>
  );
}
