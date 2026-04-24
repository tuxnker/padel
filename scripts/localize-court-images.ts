import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Court } from "../src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicImageDir = path.join(projectRoot, "public/court-images");
const dataFiles = [
  path.join(projectRoot, "src/data/courts-seed.json"),
  path.join(projectRoot, "src/data/courts-scraped.json"),
];

type CourtSeed = Omit<Court, "id" | "email"> & {
  id?: string;
  email?: string | null;
};

function imageExtension(contentType: string | null, url: string) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return "jpg";

  const extension = path.extname(new URL(url).pathname).replace(".", "").toLowerCase();
  return extension || "jpg";
}

function safeSlug(slug: string): string {
  const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!cleaned || cleaned === "-" || cleaned === "--") {
    throw new Error(`Invalid slug for image filename: ${JSON.stringify(slug)}`);
  }
  return cleaned;
}

async function downloadImage(url: string, slug: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PadelConnectAssetLocalizer/1.0 (+https://padelconnect.ie)",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const extension = imageExtension(response.headers.get("content-type"), url);
  const fileName = `${safeSlug(slug)}.${extension}`;
  const filePath = path.join(publicImageDir, fileName);

  // Defence-in-depth: after joining, assert the resolved path is still inside the image dir.
  const resolvedImageDir = path.resolve(publicImageDir);
  const resolvedFilePath = path.resolve(filePath);
  if (
    resolvedFilePath !== path.join(resolvedImageDir, fileName) ||
    !resolvedFilePath.startsWith(`${resolvedImageDir}${path.sep}`)
  ) {
    throw new Error(`Refusing to write outside image dir: ${resolvedFilePath}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await fs.writeFile(resolvedFilePath, bytes);

  return `/court-images/${fileName}`;
}

async function localizeCourts(courts: CourtSeed[]) {
  const localizedByUrl = new Map<string, string>();
  const updatedCourts: CourtSeed[] = [];
  let downloaded = 0;

  await fs.mkdir(publicImageDir, { recursive: true });

  for (const court of courts) {
    let imageUrl = court.image_url;

    if (imageUrl?.startsWith("http")) {
      const existingLocalUrl = localizedByUrl.get(imageUrl);
      if (existingLocalUrl) {
        imageUrl = existingLocalUrl;
      } else {
        imageUrl = await downloadImage(imageUrl, court.slug);
        localizedByUrl.set(court.image_url ?? "", imageUrl);
        downloaded += 1;
      }
    }

    updatedCourts.push({
      ...court,
      image_url: imageUrl,
      price_peak_eur: court.membership_required ? null : court.price_peak_eur,
      price_offpeak_eur: court.membership_required ? null : court.price_offpeak_eur,
    });
  }

  return { courts: updatedCourts, downloaded };
}

async function run() {
  let totalDownloaded = 0;

  for (const dataFile of dataFiles) {
    const courts = JSON.parse(await fs.readFile(dataFile, "utf8")) as CourtSeed[];
    const { courts: localizedCourts, downloaded } = await localizeCourts(courts);

    totalDownloaded += downloaded;
    await fs.writeFile(dataFile, `${JSON.stringify(localizedCourts, null, 2)}\n`);
    console.log(`Updated ${path.relative(projectRoot, dataFile)} (${downloaded} downloads).`);
  }

  console.log(`Finished localizing court images. Downloaded ${totalDownloaded} image files.`);
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
