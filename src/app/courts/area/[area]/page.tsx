import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import seedCourts from "@/data/courts-seed.json";
import type { Court } from "@/types";
import { AREAS, getArea, courtMatchesArea } from "@/lib/areas";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { formatPricePerHourOrNull } from "@/lib/utils";

type SeedCourt = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
};

const fallbackCourts: Court[] = (seedCourts as SeedCourt[]).map((court) => ({
  ...court,
  id: court.id ?? court.slug,
  email: court.email ?? null,
}));

export function generateStaticParams() {
  return AREAS.map((area) => ({ area: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) return { title: "Area not found", robots: { index: false, follow: false } };

  const title = `Padel Courts in ${area.name}`;
  const description = `${area.blurb} Compare prices, view amenities, and find players for open games at padel venues in ${area.name}, ${area.region}.`;
  const canonical = `/courts/area/${area.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(canonical),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

async function loadCourtsForArea(slug: string): Promise<Court[] | null> {
  const area = getArea(slug);
  if (!area) return null;

  const supabase = await createClient();
  const { data: dbCourts } = await supabase
    .from("courts")
    .select("*")
    .order("featured", { ascending: false })
    .order("name");

  const merged = new Map<string, Court>();
  for (const court of fallbackCourts) merged.set(court.slug, court);
  for (const court of (dbCourts ?? []) as Court[]) merged.set(court.slug, court);

  return [...merged.values()].filter((court) => courtMatchesArea(court, area));
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const courts = (await loadCourtsForArea(slug)) ?? [];
  const canonical = `/courts/area/${area.slug}`;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Padel courts in ${area.name}`,
    numberOfItems: courts.length,
    itemListElement: courts.map((court, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/courts/${court.slug}`),
      name: court.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Courts", item: absoluteUrl("/courts") },
      { "@type": "ListItem", position: 3, name: area.name, item: absoluteUrl(canonical) },
    ],
  };

  return (
    <div className="px-5 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-on-surface-variant">
        <ol className="flex flex-wrap gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
          </li>
          <li>
            <Link href="/courts" className="hover:underline">
              Courts
            </Link>
            <span aria-hidden="true"> / </span>
          </li>
          <li aria-current="page" className="text-on-surface">
            {area.name}
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        <p className="font-headline text-xs font-bold uppercase tracking-wider text-primary">
          {area.region}
        </p>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Padel Courts in {area.name}
        </h1>
        <p className="text-base text-on-surface-variant">{area.blurb}</p>
        <p className="text-sm text-on-surface-variant">
          {courts.length === 0
            ? "No padel courts indexed here yet — check back soon."
            : `${courts.length} ${courts.length === 1 ? "venue" : "venues"} in ${area.name}.`}
        </p>
      </header>

      {courts.length > 0 && (
        <section>
          <h2 className="sr-only">Padel venues in {area.name}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {courts.map((court) => {
              const priceLabel = court.membership_required
                ? "Members only"
                : (formatPricePerHourOrNull(court.price_offpeak_eur) ??
                  "Pricing on request");
              return (
                <li key={court.slug}>
                  <Link
                    href={`/courts/${court.slug}`}
                    className="block overflow-hidden rounded-2xl border border-outline-variant bg-surface-container ambient-shadow"
                  >
                    <div className="relative h-40">
                      {court.image_url ? (
                        <Image
                          src={court.image_url}
                          alt={court.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full signature-gradient flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary text-4xl opacity-30">
                            sports_tennis
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline text-lg font-extrabold text-on-surface">
                        {court.name}
                      </h3>
                      <p className="mt-1 text-xs text-on-surface-variant line-clamp-1">
                        {court.address}
                      </p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {court.court_count} {court.court_type} courts • {priceLabel}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-headline text-lg font-extrabold text-on-surface">
          Padel in other areas
        </h2>
        <ul className="flex flex-wrap gap-2">
          {AREAS.filter((other) => other.slug !== area.slug).map((other) => (
            <li key={other.slug}>
              <Link
                href={`/courts/area/${other.slug}`}
                className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container px-4 py-2 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                Padel in {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
