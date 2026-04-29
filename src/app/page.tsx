import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { AREAS } from "@/lib/areas";

export const metadata: Metadata = {
  title: "Find one more player. Fill games. Play more.",
  description:
    "OM Player connects padel players to open games at courts near you. Find one more player, fill your match and get on court.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} - One More Player`,
    description:
      "Find one more player and fill your padel game. Open matches at courts near you.",
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

const FEATURES = [
  {
    icon: "groups",
    title: "Find players",
    body: "Connect with nearby players by level, location, and availability.",
    href: "/play",
  },
  {
    icon: "sports_tennis",
    title: "Fill games",
    body: "Post open spots and complete your match faster.",
    href: "/play",
  },
  {
    icon: "map",
    title: "Discover courts",
    body: "Explore venues, prices, amenities, and booking options.",
    href: "/courts",
  },
] as const;

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "SportsApplication",
  operatingSystem: "Any",
  description:
    "Find one more player and fill your padel game. Open matches at courts near you.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
};

function CourtLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 600"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full text-primary opacity-[0.08]"
    >
      <g stroke="currentColor" strokeWidth="1.25" fill="none">
        <line x1="0" y1="100" x2="1440" y2="100" />
        <line x1="0" y1="300" x2="1440" y2="300" />
        <line x1="0" y1="500" x2="1440" y2="500" />
        <line x1="240" y1="0" x2="240" y2="600" />
        <line x1="720" y1="0" x2="720" y2="600" />
        <line x1="1200" y1="0" x2="1200" y2="600" />
      </g>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <section className="relative overflow-hidden">
        <CourtLines />
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px] pointer-events-none"
        />
        <div className="relative mx-auto max-w-screen-xl grid md:grid-cols-[1fr_minmax(0,420px)] items-center gap-10 px-5 sm:px-8 pt-10 pb-12 md:pt-16 md:pb-20">
          <div>
            <p className="font-label text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
              {SITE_NAME} — One More Player
            </p>
            <h1 className="mt-4 font-headline text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-on-surface">
              Find one more player.
              <span className="block text-primary">Play more padel.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base md:text-lg text-on-surface-variant">
              Join open padel games, find players near you, and fill the last
              spot at courts around the world.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label text-base font-bold text-on-primary hover:bg-primary-dim transition-colors"
              >
                Find a Game
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/play"
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-3 font-label text-base font-bold text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                Create a Game
              </Link>
            </div>
          </div>

          <div className="hidden md:block relative">
            <Image
              src="/brand/hero-phone.png"
              alt="OM Player app preview"
              width={941}
              height={1672}
              priority
              sizes="(min-width: 768px) 420px, 0px"
              className="mx-auto h-[520px] w-auto rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-3xl border border-outline-variant/60 bg-surface-container p-6 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            >
              <span className="material-symbols-outlined text-primary text-3xl">
                {feature.icon}
              </span>
              <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                {feature.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-5 sm:px-8 space-y-3">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
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

      <section className="mx-auto max-w-screen-xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container p-6 md:p-10 text-on-surface shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <CourtLines />
          <div
            aria-hidden
            className="absolute right-0 top-0 h-full w-1 bg-primary"
          />
          <div className="relative max-w-2xl">
            <h2 className="font-headline text-xl md:text-2xl font-extrabold">
              Never miss a game because you are one player short.
            </h2>
            <p className="mt-2 text-sm md:text-base text-on-surface-variant">
              Create an open game, invite local players, and let {SITE_NAME}{" "}
              help fill the court.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/play"
                className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 font-headline text-sm font-bold text-on-primary hover:bg-primary-dim transition-colors"
              >
                Create a Game
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/play"
                className="inline-flex items-center rounded-full border border-outline-variant px-5 py-2 font-headline text-sm font-bold text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                Browse Open Games
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
