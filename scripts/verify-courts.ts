import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Court } from "../src/types";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type CourtSummary = Pick<
  Court,
  "slug" | "name" | "latitude" | "longitude" | "court_count" | "court_type" | "status"
>;

const requiredSlugs = [
  "house-of-padel",
  "bushypark-tennis-and-padel-club",
  "padel-dome",
  "sportsco",
  "druid-padel-coolmine-rfc",
  "fitzpatrick-castle-hotel",
  "bective-ltc",
  "fitzwilliam-lawn-tennis-club",
  "rockbrook-padel",
  "portmarnock-padel",
  "westwood-westmanstown",
  "west-wood-club",
  "padelzone-cellbridge",
  "south-padel-at-the-k-club",
  "padel-tennis-ireland",
  "padel-ck-ballincollig",
  "padel-lk",
  "adare-manor-padel-club",
  "project-padel-galway",
  "planet-padel",
  "tralee-padel-club",
  "padel-54-degrees-north",
  "eddie-irvine-padel-centre",
  "padel-society",
];

function distance(a: CourtSummary, b: CourtSummary) {
  return Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
}

async function verify() {
  const seedCourts = JSON.parse(
    await fs.readFile(path.resolve(__dirname, "../src/data/courts-seed.json"), "utf8")
  ) as CourtSummary[];
  const seedSlugs = new Set(seedCourts.map((court) => court.slug));

  const { data, error } = await supabase
    .from("courts")
    .select("slug, name, latitude, longitude, court_count, court_type, status")
    .order("name");

  if (error) {
    throw new Error(`Failed to verify courts: ${error.message}`);
  }

  const courts = (data ?? []) as CourtSummary[];
  const missingRequired = requiredSlugs.filter(
    (slug) => !courts.some((court) => court.slug === slug)
  );
  const outsideSeed = courts.filter((court) => !seedSlugs.has(court.slug));
  const nearDuplicates: Array<[CourtSummary, CourtSummary]> = [];

  for (let i = 0; i < courts.length; i += 1) {
    for (let j = i + 1; j < courts.length; j += 1) {
      if (distance(courts[i], courts[j]) < 0.0015) {
        nearDuplicates.push([courts[i], courts[j]]);
      }
    }
  }

  console.log(`Courts in DB: ${courts.length}`);
  console.log(`Canonical seed courts: ${seedCourts.length}`);
  console.log(`Required venue slugs missing: ${missingRequired.length}`);
  if (missingRequired.length > 0) console.log(missingRequired.join("\n"));
  console.log(`Existing non-seed rows kept: ${outsideSeed.length}`);
  if (outsideSeed.length > 0) {
    console.log(outsideSeed.map((court) => `${court.slug} | ${court.name}`).join("\n"));
  }
  console.log(`Near-coordinate duplicate pairs: ${nearDuplicates.length}`);
  if (nearDuplicates.length > 0) {
    console.log(
      nearDuplicates
        .map(([a, b]) => `${a.slug} | ${a.name} <-> ${b.slug} | ${b.name}`)
        .join("\n")
    );
  }
}

verify().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
