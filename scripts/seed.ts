import { createClient } from "@supabase/supabase-js";
import type { Court, CourtType } from "../src/types";
import * as dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SeedCourt = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
  lat?: number | null;
  lng?: number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const legacySlugAliases: Record<string, string> = {
  "bushy-park-tennis-padel": "bushypark-tennis-and-padel-club",
  "david-lloyd-riverview": "david-lloyd-dublin-riverview",
  "dublin-sports-dome": "padel-dome",
  "fitzwilliam-ltc": "fitzwilliam-lawn-tennis-club",
  "galway-padel-club": "project-padel-galway",
  "kilkenny-padel": "kilkenny-tennis-club",
  "munster-padel-limerick": "padel-lk",
  "padelzone-celbridge": "padelzone-cellbridge",
  "the-padel-club": "adare-manor-padel-club",
  "west-wood-leopardstown": "west-wood-club",
};

const invalidCourtSlugs = [
  "belfast-indoor-padel",
  "castleknock-padel",
  "drogheda-padel",
  "dun-laoghaire-padel",
  "greystones-padel",
  "herbert-park-padel",
  "malahide-padel",
  "padel04",
  "riverview-racquet-club",
  "swords-padel-hub",
  "the-shed-padel-cork",
  "waterford-padel-arena",
];

type ExistingCourt = Pick<Court, "id" | "slug" | "name">;

async function dedupeLegacyCourtSlugs() {
  const { data, error } = await supabase.from("courts").select("id, slug, name");

  if (error) {
    throw new Error(`Failed to read courts for dedupe: ${error.message}`);
  }

  const courtsBySlug = new Map(
    ((data ?? []) as ExistingCourt[]).map((court) => [court.slug, court])
  );
  let deletedLegacyRows = 0;
  let remappedPosts = 0;

  for (const [legacySlug, canonicalSlug] of Object.entries(legacySlugAliases)) {
    const legacyCourt = courtsBySlug.get(legacySlug);
    const canonicalCourt = courtsBySlug.get(canonicalSlug);

    if (!legacyCourt || !canonicalCourt) continue;

    const { data: remappedPostRows, error: postError } = await supabase
      .from("posts")
      .update({ court_id: canonicalCourt.id })
      .eq("court_id", legacyCourt.id)
      .select("id");

    if (postError) {
      throw new Error(
        `Failed to remap posts from ${legacySlug} to ${canonicalSlug}: ${postError.message}`
      );
    }

    const { error: deleteError } = await supabase
      .from("courts")
      .delete()
      .eq("id", legacyCourt.id);

    if (deleteError) {
      throw new Error(`Failed to delete legacy court ${legacySlug}: ${deleteError.message}`);
    }

    remappedPosts += remappedPostRows?.length ?? 0;
    deletedLegacyRows += 1;
    console.log(`Deduped ${legacySlug} -> ${canonicalSlug}`);
  }

  return { deletedLegacyRows, remappedPosts };
}

async function deleteInvalidCourts() {
  const { data, error } = await supabase
    .from("courts")
    .delete()
    .in("slug", invalidCourtSlugs)
    .select("slug");

  if (error) {
    throw new Error(`Failed to delete invalid court rows: ${error.message}`);
  }

  return data?.length ?? 0;
}

async function seed() {
  const courts = JSON.parse(
    await fs.readFile(path.resolve(__dirname, "../src/data/courts-seed.json"), "utf8")
  ) as SeedCourt[];

  console.log(`Seeding ${courts.length} courts...`);

  const mappedCourts = courts.map((c) => {
    const { lat, lng, ...rest } = c;
    const courtType: CourtType =
      rest.court_type === "indoor" ||
      rest.court_type === "outdoor" ||
      rest.court_type === "covered"
        ? rest.court_type
        : "indoor";

    return {
      ...rest,
      email: rest.email ?? null,
      latitude: rest.latitude ?? lat ?? 0,
      longitude: rest.longitude ?? lng ?? 0,
      court_count: rest.court_count ?? 1,
      court_type: courtType,
      status: rest.status ?? "open",
    };
  });

  const { error } = await supabase.from("courts").upsert(mappedCourts, {
    onConflict: "slug",
  });

  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  const { deletedLegacyRows, remappedPosts } = await dedupeLegacyCourtSlugs();
  const deletedInvalidRows = await deleteInvalidCourts();
  const { count, error: countError } = await supabase
    .from("courts")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to verify court count: ${countError.message}`);
  }

  console.log(
    `Seed complete. Courts in DB: ${count ?? 0}. Removed ${deletedLegacyRows} legacy duplicates, ${deletedInvalidRows} invalid rows, and remapped ${remappedPosts} posts.`
  );
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
