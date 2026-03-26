import { redirect } from "next/navigation";

import { getRandomBandSlug } from "@/lib/archive";

export const dynamic = "force-dynamic";

export default async function RandomBandPage() {
  const slug = await getRandomBandSlug();
  if (slug) {
    redirect(`/bands/${slug}`);
  }
  redirect("/bands");
}
