import Link from "next/link";

import { getLabels } from "@/lib/archive";

export const revalidate = 300;

export const metadata = {
  title: "Labels",
  description: "Record labels linked to bands in the Kosovo Alt Scene archive.",
};

export default async function LabelsPage() {
  const labels = await getLabels();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Labels</h1>
        <p className="mt-2 text-foreground/70">
          Record labels linked to bands in the archive. Select a label to see its bands.
        </p>
      </header>

      {labels.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {labels.map((label) => (
            <li key={label.id}>
              <Link
                href={`/labels/${label.slug}`}
                className="block border border-foreground/20 p-4 transition hover:border-foreground/40 hover:text-accent"
              >
                <span className="font-semibold uppercase tracking-wide">{label.name}</span>
                <span className="ml-2 text-sm text-foreground/70">({label._count.bands})</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded border border-foreground/20 bg-foreground/5 p-6 text-foreground/70">
          No labels in the archive yet. Labels can be added when editing bands in Admin.
        </p>
      )}
    </div>
  );
}
