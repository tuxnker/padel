import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import seedCourts from "@/data/courts-seed.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: courts } = await supabase.from("courts").select("slug");
  const courtSlugs = [
    ...(seedCourts as Array<{ slug: string }>),
    ...((courts ?? []) as Array<{ slug: string }>),
  ].filter(
    (court, index, allCourts) =>
      allCourts.findIndex((candidate) => candidate.slug === court.slug) === index
  );

  const courtPages = courtSlugs.map((court) => ({
    url: `https://padelconnect.ie/courts/${court.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://padelconnect.ie",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://padelconnect.ie/courts",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://padelconnect.ie/play",
      changeFrequency: "hourly",
      priority: 0.7,
    },
    ...courtPages,
  ];
}
