import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BookingMethod, Court, CourtStatus, CourtType } from "../src/types";

const PADELCOURTS_API_URL = "https://padelcourts.ie/api/venues";
const LOVEPADEL_ARTICLE_URL =
  "https://lovepadel.ie/blogs/news/where-to-play-padel-in-ireland-interactive-map-of-courts-nationwide";
const PADELCOURTS_ASSET_BASE_URL = "https://padelcourts.ie";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

type CourtSeed = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
};

type PadelCourtsVenue = {
  id?: string;
  name: string;
  slug?: string;
  county?: string | null;
  city?: string | null;
  address?: string | null;
  eircode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  numCourtsIndoor?: number | null;
  numCourtsOutdoor?: number | null;
  totalCourts?: number | null;
  amenities?: string[] | null;
  services?: string[] | null;
  openingHours?: Record<string, string> | null;
  priceRange?: string | null;
  bookingUrl?: string | null;
  featuredImage?: string | null;
  status?: string | null;
  isFeatured?: boolean | null;
};

type LovePadelPlace = {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  court_type: CourtType;
};

const LOVEPADEL_SLUG_ALIASES: Record<string, string> = {
  "ballymascanlon-hotel-and-golf-resort": "padel-at-ballymascanlon",
  "ballymascanlon-hotel-golf-resort": "padel-at-ballymascanlon",
  "bective-tennis-and-padel": "bective-ltc",
  "bective-tennis-padel": "bective-ltc",
  "borris-ileigh-gaa-club": "borrisoleigh-town-park",
  "bushy-park-tennis-and-padel-club": "bushypark-tennis-and-padel-club",
  "castle-oaks-house-hotel-and-estate": "castle-oaks-house-hotel",
  "castle-durrow-pavilion-and-tennis-court": "the-pavilion-padel-club-at-castle-durrow",
  "cavan-lawn-tennis-club": "cavan-lawn-tennis-padel-club",
  "connemara-sands-beach-hotel-and-spa": "connemara-sands-padel-club",
  "dlr-leisure-meadowbrook": "padel-at-dlr-leisure-meadowbrook",
  "eddie-irvine-sports": "eddie-irvine-padel-centre",
  "edgeworthstown-district-development-association-clg": "edgeworthstown-padel-longford",
  "elm-park-golf-and-sports-club": "elm-park-padel-club",
  "galgorm-castle-golf-club": "padel-at-galgorm-castle",
  "kilkenny-county-and-city-lawn-tennis-club": "kilkenny-tennis-club",
  "kilkenny-county-city-lawn-tennis-club": "kilkenny-tennis-club",
  "killyhevlin-lakeside-hotel-and-lodges": "killyhevlin-lakeside-hotel-lodges",
  "let-s-go-padel-ballyclare": "lets-go-padel-ballyclare",
  "let-s-go-padel-carryduff": "lets-go-padel-carryduff",
  "let-s-go-padel-crumlin-road": "lets-go-padel-crumlin-road",
  "let-s-go-padel-derry": "lets-go-padel-derry",
  "let-s-go-padel-omagh": "lets-go-padel-omagh",
  "lets-go-padel-ballyclare": "lets-go-padel-ballyclare",
  "lets-go-padel-carryduff": "lets-go-padel-carryduff",
  "lets-go-padel-crumlin-road": "lets-go-padel-crumlin-road",
  "lets-go-padel-derry": "lets-go-padel-derry",
  "lets-go-padel-newry": "let-s-go-padel-newry",
  "lets-go-padel-omagh": "lets-go-padel-omagh",
  "malahide-lawn-tennis-and-croquet-club": "malahide-lawn-tennis-croquet-club",
  "padel-54": "padel-54-degrees-north",
  "padel-courts-at-shankill-tc": "shankill-tennis-club",
  "padel-park-letterkenny": "padelpark",
  "padel-pslc-portmarnock": "portmarnock-padel",
  "padelzone-celbridge-5-indoor-padel-courts": "padelzone-cellbridge",
  "river-valley-holiday-park": "river-valley-padel",
  "rosslare-community-and-sports-centre": "rosslare-community-sports-centre",
  "sportsco": "sportsco",
  "talbot-hotel-carlow": "talbot-padel-club",
  "the-green-edgeworthstown": "edgeworthstown-padel-longford",
  "the-hive": "the-hive-padel-club",
  "the-k-club": "south-padel-at-the-k-club",
  "the-padel-club": "adare-manor-padel-club",
  "wepadel-monaghan": "wepadel",
  "woodlands-hotel-and-leisure-centre": "woodlands-hotel-leisure-waterford-padel",
  "woodlands-hotel-leisure-centre": "woodlands-hotel-leisure-waterford-padel",
};

const COURT_OVERRIDES: Record<string, Partial<CourtSeed>> = {
  "bective-ltc": {
    name: "Bective Lawn Tennis Club",
    address: "Donnybrook, Dublin 4",
    latitude: 53.3212078,
    longitude: -6.2346986,
    court_count: 1,
    court_type: "outdoor",
    membership_required: true,
  },
  "druid-padel-coolmine-rfc": {
    name: "Druid Padel (Coolmine RFC)",
    court_count: 4,
    court_type: "outdoor",
  },
  "fitzpatrick-castle-hotel": {
    name: "Fitzpatrick's Castle",
    court_count: 2,
    court_type: "outdoor",
  },
  "fitzwilliam-lawn-tennis-club": {
    name: "Fitzwilliam LTC",
    address: "Appian Way, Dublin 6",
    membership_required: true,
  },
  "house-of-padel": {
    court_count: 4,
    court_type: "indoor",
    membership_required: false,
  },
  "padel-society": {
    name: "Padel Society (Muckamore)",
  },
  "padelzone-cellbridge": {
    name: "O'Hanlon Park / PadelZone Celbridge",
    court_count: 5,
    court_type: "indoor",
  },
  "planet-padel": {
    name: "Planet Padel Athlone",
  },
  "project-padel-galway": {
    name: "Galway Padel (Corrib Centre)",
  },
  "sportsco": {
    name: "Druid Padel (Sportsco)",
    court_type: "outdoor",
    membership_required: true,
  },
  "west-wood-club": {
    name: "West Wood Leopardstown",
    court_count: 8,
    court_type: "indoor",
    status: "coming_soon",
  },
};

const MANUAL_COURTS: CourtSeed[] = [
  {
    name: "Rockbrook Padel Club",
    slug: "rockbrook-padel",
    address: "Rockbrook, Rathfarnham, Dublin",
    eircode: null,
    latitude: 53.2624196,
    longitude: -6.3006718,
    court_count: 2,
    court_type: "outdoor",
    price_peak_eur: null,
    price_offpeak_eur: null,
    membership_required: false,
    booking_url: "https://padel-ireland.ie",
    booking_method: "website",
    website: "https://padel-ireland.ie",
    phone: null,
    hours: null,
    amenities: ["parking"],
    status: "open",
    featured: false,
    image_url: null,
  },
  {
    name: "Westwood Westmanstown",
    slug: "westwood-westmanstown",
    address: "Westmanstown, Dublin 15, D15 T447",
    eircode: "D15 T447",
    latitude: 53.37967,
    longitude: -6.43932,
    court_count: 1,
    court_type: "indoor",
    price_peak_eur: null,
    price_offpeak_eur: null,
    membership_required: true,
    booking_url: null,
    booking_method: null,
    website: "https://westwood.ie",
    phone: "01 802 5906",
    hours: null,
    amenities: ["parking", "changing_rooms", "showers", "gym"],
    status: "open",
    featured: false,
    image_url: null,
  },
  {
    name: "Padel CK (Ballincollig)",
    slug: "padel-ck-ballincollig",
    address: "Ballincollig, Cork",
    eircode: null,
    latitude: 51.8879,
    longitude: -8.5896,
    court_count: 16,
    court_type: "indoor",
    price_peak_eur: null,
    price_offpeak_eur: null,
    membership_required: false,
    booking_url: null,
    booking_method: null,
    website: null,
    phone: null,
    hours: null,
    amenities: ["parking"],
    status: "coming_soon",
    featured: false,
    image_url: null,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string | null | undefined) {
  return decodeHtml(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hasUsableCoordinates(court: Pick<CourtSeed, "latitude" | "longitude">) {
  return (
    Number.isFinite(court.latitude) &&
    Number.isFinite(court.longitude) &&
    Math.abs(court.latitude) > 0 &&
    Math.abs(court.longitude) > 0
  );
}

const FETCH_TIMEOUT_MS = 15_000;

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PadelConnectScraper/1.0 (+https://padelconnect.ie)",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "PadelConnectScraper/1.0 (+https://padelconnect.ie)",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function normalizeAmenities(values: Array<string | null | undefined>) {
  const aliases: Record<string, string> = {
    "changing rooms": "changing_rooms",
    "equipment rental": "rental",
    "pay to play": "pay_to_play",
    "pro shop": "pro_shop",
    "snack bar": "snack_bar",
    "steam room": "steam_room",
  };

  const amenities = values
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim().toLowerCase().replace(/&/g, "and"))
    .map((value) => aliases[value] ?? value.replace(/\s+/g, "_"));

  return [...new Set(amenities)].sort();
}

function parseEuroPriceRange(priceRange: string | null | undefined) {
  if (!priceRange || !priceRange.includes("€")) {
    return { offpeak: null, peak: null };
  }

  const prices = [...priceRange.matchAll(/€\s*(\d+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite);

  if (prices.length === 0) return { offpeak: null, peak: null };

  return {
    offpeak: Math.min(...prices),
    peak: Math.max(...prices),
  };
}

function inferCourtType(indoor: number, outdoor: number): CourtType {
  if (indoor > 0 && outdoor === 0) return "indoor";
  if (outdoor > 0 && indoor === 0) return "outdoor";
  if (indoor > 0 && outdoor > 0) return "covered";
  return "outdoor";
}

function inferBookingMethod(bookingUrl: string | null | undefined, phone: string | null | undefined): BookingMethod | null {
  if (!bookingUrl) return phone ? "phone" : null;

  const lowerUrl = bookingUrl.toLowerCase();
  if (lowerUrl.includes("playtomic")) return "playtomic";
  if (lowerUrl.includes("app") || lowerUrl.includes("matchi") || lowerUrl.includes("project")) return "own_app";
  return "website";
}

function inferStatus(venue: PadelCourtsVenue): CourtStatus {
  const source = `${venue.name} ${stripHtml(venue.description)}`.toLowerCase();
  if (source.includes("coming soon") || source.includes("opening q") || source.includes("opening summer")) {
    return "coming_soon";
  }
  if (venue.status && !["active", "open"].includes(venue.status.toLowerCase())) {
    return "closed";
  }
  return "open";
}

function mapPadelCourtsVenue(venue: PadelCourtsVenue): CourtSeed | null {
  const latitude = toNumber(venue.latitude);
  const longitude = toNumber(venue.longitude);
  if (latitude === null || longitude === null) {
    console.warn(
      `[scraper] dropping venue without coordinates: ${venue?.name ?? "(unnamed)"} (${venue?.id ?? "?"})`,
    );
    return null;
  }

  const indoor = venue.numCourtsIndoor ?? 0;
  const outdoor = venue.numCourtsOutdoor ?? 0;
  const courtCount = venue.totalCourts ?? (indoor + outdoor || 1);
  const prices = parseEuroPriceRange(venue.priceRange);
  const amenities = normalizeAmenities([...(venue.amenities ?? []), ...(venue.services ?? [])]);
  const servicesText = (venue.services ?? []).join(" ").toLowerCase();
  const membershipRequired =
    servicesText.includes("membership") && !servicesText.includes("pay to play");
  const bookingUrl = venue.bookingUrl ?? null;
  const website = venue.website ?? null;
  const imageUrl = venue.featuredImage
    ? venue.featuredImage.startsWith("/")
      ? `${PADELCOURTS_ASSET_BASE_URL}${venue.featuredImage}`
      : venue.featuredImage
    : null;

  return applyOverrides({
    name: venue.name.replace(/^\*COMING SOON\*\s*/i, "").trim(),
    slug: venue.slug ?? slugify(venue.name),
    address: [venue.address, venue.city, venue.county].filter(Boolean).join(", "),
    eircode: venue.eircode ?? null,
    latitude,
    longitude,
    court_count: courtCount,
    court_type: inferCourtType(indoor, outdoor),
    price_peak_eur: membershipRequired ? null : prices.peak,
    price_offpeak_eur: membershipRequired ? null : prices.offpeak,
    membership_required: membershipRequired,
    booking_url: bookingUrl,
    booking_method: inferBookingMethod(bookingUrl, venue.phone),
    website,
    phone: venue.phone ?? null,
    hours: venue.openingHours ?? null,
    amenities,
    status: inferStatus(venue),
    featured: Boolean(venue.isFeatured),
    image_url: imageUrl,
  });
}

function styleToCourtType(styleUrl: string): CourtType {
  if (styleUrl.includes("E65100") || styleUrl.includes("FF5252")) return "indoor";
  return "outdoor";
}

function parseLovePadelKml(kml: string): LovePadelPlace[] {
  return [...kml.matchAll(/<Placemark>([\s\S]*?)<\/Placemark>/g)]
    .map((match) => {
      const fragment = match[1];
      const rawName = fragment.match(/<name>([\s\S]*?)<\/name>/)?.[1];
      const rawStyle = fragment.match(/<styleUrl>#?([^<]+)<\/styleUrl>/)?.[1] ?? "";
      const rawCoordinates = fragment.match(/<coordinates>\s*([^<]+?)\s*<\/coordinates>/)?.[1];
      if (!rawName || !rawCoordinates) return null;

      const [longitude, latitude] = rawCoordinates.split(",").map(Number);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

      const name = decodeHtml(rawName).trim();
      const slug = LOVEPADEL_SLUG_ALIASES[slugify(name)] ?? slugify(name);

      return {
        name,
        slug,
        latitude,
        longitude,
        court_type: styleToCourtType(rawStyle),
      };
    })
    .filter((place): place is LovePadelPlace => Boolean(place));
}

async function scrapePadelCourts() {
  const venues = await fetchJson<PadelCourtsVenue[]>(PADELCOURTS_API_URL);
  return venues.map(mapPadelCourtsVenue).filter((court): court is CourtSeed => Boolean(court));
}

async function scrapeLovePadel() {
  const articleHtml = await fetchText(LOVEPADEL_ARTICLE_URL);
  const embedUrl = decodeHtml(articleHtml).match(/https:\/\/www\.google\.com\/maps\/d\/u\/\d+\/embed\?[^"'<>]*mid=([^&"'<>]+)/)?.[0];
  const mid = embedUrl?.match(/[?&]mid=([^&]+)/)?.[1];

  if (!mid) {
    throw new Error("Could not find LovePadel Google My Maps embed id");
  }

  const kml = await fetchText(`https://www.google.com/maps/d/kml?mid=${encodeURIComponent(mid)}&forcekml=1`);

  return parseLovePadelKml(kml).map<CourtSeed>((place) =>
    applyOverrides({
      name: place.name,
      slug: place.slug,
      address: place.name,
      eircode: null,
      latitude: place.latitude,
      longitude: place.longitude,
      court_count: 1,
      court_type: place.court_type,
      price_peak_eur: null,
      price_offpeak_eur: null,
      membership_required: false,
      booking_url: null,
      booking_method: null,
      website: null,
      phone: null,
      hours: null,
      amenities: null,
      status: "open",
      featured: false,
      image_url: null,
    })
  );
}

function applyOverrides(court: CourtSeed): CourtSeed {
  return {
    ...court,
    ...(COURT_OVERRIDES[court.slug] ?? {}),
  };
}

function mergeCourts(...courtLists: CourtSeed[][]) {
  const bySlug = new Map<string, CourtSeed>();

  for (const court of courtLists.flat()) {
    if (!hasUsableCoordinates(court)) continue;
    const existing = bySlug.get(court.slug);

    if (!existing) {
      bySlug.set(court.slug, court);
      continue;
    }

    const hasVenueDetails = Boolean(
      court.website ||
        court.phone ||
        court.booking_url ||
        court.image_url ||
        court.amenities?.length ||
        court.hours
    );

    bySlug.set(
      court.slug,
      hasVenueDetails
        ? {
            ...existing,
            ...court,
            amenities: court.amenities?.length ? court.amenities : existing.amenities,
            image_url: court.image_url ?? existing.image_url,
          }
        : {
            ...existing,
            latitude: court.latitude,
            longitude: court.longitude,
          }
    );
  }

  return [...bySlug.values()]
    .map(applyOverrides)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function runScraper() {
  console.log("Scraping padelcourts.ie API...");
  const padelCourts = await scrapePadelCourts();
  console.log(`Found ${padelCourts.length} usable padelcourts.ie venues.`);

  console.log("Scraping LovePadel embedded map...");
  const lovePadelCourts = await scrapeLovePadel();
  console.log(`Found ${lovePadelCourts.length} LovePadel map pins.`);

  const courts = mergeCourts(padelCourts, lovePadelCourts, MANUAL_COURTS);
  const scrapedPath = path.join(projectRoot, "src/data/courts-scraped.json");
  const seedPath = path.join(projectRoot, "src/data/courts-seed.json");
  const json = `${JSON.stringify(courts, null, 2)}\n`;

  await fs.writeFile(scrapedPath, json);
  await fs.writeFile(seedPath, json);

  console.log(`Wrote ${courts.length} deduped courts to:`);
  console.log(`- ${scrapedPath}`);
  console.log(`- ${seedPath}`);
}

runScraper().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
