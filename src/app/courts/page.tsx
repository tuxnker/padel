import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import seedCourts from "@/data/courts-seed.json";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { CourtsClient } from "./courts-client";

export const metadata: Metadata = {
  title: "Browse Padel Courts in Ireland",
  description:
    "Map and directory of every padel court in Ireland. Filter by indoor or outdoor, compare peak and off-peak prices, and find courts near you.",
  alternates: { canonical: "/courts" },
  openGraph: {
    title: `Browse Padel Courts in Ireland | ${SITE_NAME}`,
    description:
      "Map and directory of every padel court in Ireland. Filter by indoor or outdoor and compare prices.",
    url: `${SITE_URL}/courts`,
  },
};

type CourtRow = { slug: string; name: string };

export default async function CourtsPage() {
  const supabase = await createClient();
  const { data: dbCourts } = await supabase
    .from("courts")
    .select("slug, name")
    .order("featured", { ascending: false })
    .order("name");

  const seedRows = (
    seedCourts as Array<{ slug: string; name: string }>
  ).map((c) => ({ slug: c.slug, name: c.name }));

  const merged = new Map<string, CourtRow>();
  for (const row of seedRows) merged.set(row.slug, row);
  for (const row of (dbCourts ?? []) as CourtRow[]) merged.set(row.slug, row);
  const courts = [...merged.values()];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Padel courts in Ireland",
    numberOfItems: courts.length,
    itemListElement: courts.slice(0, 50).map((court, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/courts/${court.slug}`),
      name: court.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <h1 className="sr-only">Padel courts in Ireland</h1>
      <CourtsClient />
    </>
  );
}
