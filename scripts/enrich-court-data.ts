import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Court } from "../src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataFiles = [
  path.join(projectRoot, "src/data/courts-seed.json"),
  path.join(projectRoot, "src/data/courts-scraped.json"),
];

type CourtSeed = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
};

const enrichments: Record<string, Partial<CourtSeed>> = {
  "charleville-community-sports-complex": {
    booking_url: "https://playtomic.com/clubs/charleville-community-sports-complex-cork",
    booking_method: "playtomic",
  },
  "cavan-lawn-tennis-padel-club": {
    phone: "083 453 2618",
  },
  "david-lloyd-dublin-riverview": {
    name: "David Lloyd Dublin Riverview",
    address: "David Lloyd Dublin Riverview, Clonskeagh Road, Dublin 14",
    court_count: 3,
    membership_required: true,
    website: "https://www.davidlloyd.ie/racquets/",
    image_url:
      "https://imagelibrary.davidlloyd.co.uk/transform/3f48c444-22f2-44f6-841d-4035a82c4771/DL-Padel-13-09-236743-RT?format=webp",
  },
  "east-point-business-park-tennis-court": {
    name: "East Point Business Park Tennis Court",
    address: "Eastpoint Business Park, Alfie Byrne Road, Dublin 3, D03 K7W7",
    membership_required: true,
    website: "https://eastpoint.ie/",
    image_url: "https://eastpoint.ie/wp-content/uploads/2024/09/home-1-opt.jpeg",
  },
  "edgeworthstown-padel-longford": {
    name: "Padel 100 - The Green, Edgeworthstown",
    address: "The Green, Edgeworthstown, Co. Longford",
    court_count: 2,
    website:
      "https://www.findpadeluk.co.uk/clubs/edgeworthstown/padel-100-the-green-edgeworthstown-longford",
    image_url:
      "https://asabbmmsonrzsiewitfz.supabase.co/storage/v1/object/public/padel-club-images/Padel_100_-_The_Green_Edgeworthstown_Longford_Edgeworthstown.webp",
  },
  "kelly-s-resort-hotel-and-spa": {
    name: "Kelly's Resort Hotel & Spa",
    address: "Kelly's Resort Hotel & Spa, Rosslare, Co. Wexford, Y35 Y83V",
    court_count: 2,
    membership_required: true,
    website: "https://www.kellys.ie/",
    phone: "+353 53 9132114",
    booking_method: "phone",
    image_url:
      "https://img.oyster.com/production/Europe/Ireland/Province%20of%20Leinster/County%20Wexford/Rosslare/Kelly%27s%20Resort%20Hotel%20%26%20Spa/Feature%20Image/large_county_wexford_hotels_kellys_resort_hotel_and_spa_feature_image_3954998211.webp",
  },
  "padel-ck-ballincollig": {
    website: "https://gopadel.ie/padel-directory/",
    image_url: "https://gopadel.ie/wp-content/uploads/2025/02/Ireland-Go-Padel-819x1024.jpeg",
  },
  "river-valley-padel": {
    website: "https://www.rivervalleypark.ie/",
  },
  "rockbrook-padel": {
    phone: "01 548 8166",
    booking_url: "https://padel-ireland.ie/bookings/",
    image_url:
      "https://padel-ireland.ie/wp-content/uploads/bfi_thumb/10346444_1003772466305127_309075972373849476_n1-pl3qc1euonn11ikt0j07f4itbtcw9nxec8pvrs1xmw.jpg",
  },
  "skill-school-hq": {
    website: "https://www.skillschoolhq.com/bookings",
  },
  "westwood-westmanstown": {
    image_url:
      "https://westwood.ie/img/asset/aW1hZ2VzLzIwMjQtcGhvdG9zL3dlc3Qtd29vZC1jbHViLmpwZw/west-wood-club.jpg?w=1500&h=1125&s=4defa2226ebf055add671a681488db8a",
  },
};

const removedDuplicateSlugs = new Set(["the-padel-club"]);

async function enrichDataFile(dataFile: string) {
  const courts = JSON.parse(await fs.readFile(dataFile, "utf8")) as CourtSeed[];
  const enrichedCourts = courts
    .filter((court) => !removedDuplicateSlugs.has(court.slug))
    .map((court) => {
      const enrichment = enrichments[court.slug];
      const mergedCourt = {
        ...court,
        ...(enrichment ?? {}),
      };

      return {
        ...mergedCourt,
        price_peak_eur: mergedCourt.membership_required ? null : mergedCourt.price_peak_eur,
        price_offpeak_eur: mergedCourt.membership_required ? null : mergedCourt.price_offpeak_eur,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  await fs.writeFile(dataFile, `${JSON.stringify(enrichedCourts, null, 2)}\n`);
  console.log(`Enriched ${path.relative(projectRoot, dataFile)} (${enrichedCourts.length} courts).`);
}

async function run() {
  for (const dataFile of dataFiles) {
    await enrichDataFile(dataFile);
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
