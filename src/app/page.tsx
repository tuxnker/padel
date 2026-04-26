import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { AREAS } from "@/lib/areas";

export const metadata: Metadata = {
  title: "Padel Courts & Players in Ireland",
  description:
    "Find padel courts in Dublin, Cork, Galway, Limerick and across Ireland. Compare prices, view amenities, and join open games near you.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} - Padel Courts & Players in Ireland`,
    description:
      "Find padel courts across Ireland. Compare prices, view amenities, and join open games near you.",
    url: SITE_URL,
  },
};

const FEATURED_AREA_SLUGS = [
  "dublin",
  "cork",
  "galway",
  "limerick",
  "kildare",
  "wicklow",
  "belfast",
];

const FEATURED_AREAS = FEATURED_AREA_SLUGS.flatMap((slug) => {
  const area = AREAS.find((a) => a.slug === slug);
  return area ? [area] : [];
});

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "SportsApplication",
  operatingSystem: "Any",
  description:
    "Discover padel courts across Ireland, compare prices and find players to join open games.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
};

export default function HomePage() {
  return (
    <div className="px-5 py-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <header className="space-y-3">
        <p className="font-headline text-sm font-bold uppercase tracking-wide text-secondary">
          {SITE_NAME}
        </p>
        <h1 className="font-headline text-3xl font-extrabold leading-tight text-on-surface">
          Find padel courts and players across Ireland
        </h1>
        <p className="text-base text-on-surface-variant">
          Compare prices, check amenities, and join open games at venues in
          Dublin, Cork, Galway and beyond.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/courts"
          className="rounded-3xl bg-surface-container p-6 shadow-sm transition hover:shadow-md"
        >
          <span className="material-symbols-outlined text-primary text-3xl">
            map
          </span>
          <h2 className="mt-3 font-headline text-xl font-extrabold text-on-surface">
            Browse padel courts
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Explore every venue on the map, filter by indoor or outdoor, and
            compare court prices.
          </p>
        </Link>

        <Link
          href="/play"
          className="rounded-3xl bg-surface-container p-6 shadow-sm transition hover:shadow-md"
        >
          <span className="material-symbols-outlined text-primary text-3xl">
            groups
          </span>
          <h2 className="mt-3 font-headline text-xl font-extrabold text-on-surface">
            Find players to play with
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Join open games at courts near you, or post your own to find
            partners at your skill level.
          </p>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="font-headline text-xl font-extrabold text-on-surface">
          Padel by area
        </h2>
        <p className="text-sm text-on-surface-variant">
          Popular padel locations in Ireland
        </p>
        <ul className="flex flex-wrap gap-2">
          {FEATURED_AREAS.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/courts/area/${area.slug}`}
                className="inline-flex items-center rounded-full bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container"
              >
                Padel in {area.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl signature-gradient p-6 text-on-primary">
        <h2 className="font-headline text-xl font-extrabold">
          Ireland&rsquo;s padel directory
        </h2>
        <p className="mt-2 text-sm opacity-90">
          {SITE_NAME} indexes padel clubs across the country with up-to-date
          prices, court counts, and booking links — so you can spend less time
          searching and more time playing.
        </p>
        <Link
          href="/courts"
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-on-primary px-5 py-2 font-headline text-sm font-bold text-primary"
        >
          Explore courts
          <span className="material-symbols-outlined text-base">
            arrow_forward
          </span>
        </Link>
      </section>
    </div>
  );
}
