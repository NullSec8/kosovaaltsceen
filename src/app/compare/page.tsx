import type { Metadata } from "next";
import { BandCompare } from "@/components/band-compare";

export const metadata: Metadata = {
  title: "Compare Bands",
  description: "Compare two Kosovo alt scene bands side by side – genres, members, albums, and more.",
};

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-wide md:text-4xl">Compare Bands</h1>
        <p className="text-foreground/70">Select two bands to see them side-by-side.</p>
      </header>
      <BandCompare />
    </div>
  );
}
