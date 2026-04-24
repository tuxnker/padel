import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BookingMethod, Court } from "../src/types";

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

type VerificationResult = {
  ok: boolean;
  status: number | null;
  finalUrl: string | null;
  reason: string;
};

const replacementBookingUrls: Record<string, { booking_url: string; booking_method: BookingMethod }> = {
  "bushypark-tennis-and-padel-club": {
    booking_url: "https://www.bushytennispadel.ie/",
    booking_method: "website",
  },
  "padel-tennis-ireland": {
    booking_url: "https://www.padeltennisireland.ie/Booking/Grid.aspx",
    booking_method: "website",
  },
};

const phoneOverrides: Record<string, string> = {
  "cavan-lawn-tennis-padel-club": "083 453 2618",
  "rockbrook-padel": "01 548 8166",
};

function isHttpUrl(url: string | null) {
  return Boolean(url && /^https?:\/\//i.test(url));
}

async function requestUrl(url: string, method: "HEAD" | "GET", timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "PadelConnectLinkVerifier/1.0 (+https://padelconnect.ie)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyUrl(url: string): Promise<VerificationResult> {
  try {
    let response = await requestUrl(url, "HEAD", 10_000);

    if ([405, 403, 404].includes(response.status)) {
      response = await requestUrl(url, "GET", 15_000);
    }

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      finalUrl: response.url,
      reason: response.statusText || "HTTP response",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: null,
      finalUrl: null,
      reason: message,
    };
  }
}

function normalizePhoneAccess(court: CourtSeed) {
  const phone = phoneOverrides[court.slug] ?? court.phone;

  if (!court.booking_url && phone) {
    return {
      ...court,
      phone,
      booking_method: "phone" as const,
    };
  }

  return {
    ...court,
    phone,
  };
}

async function verifyCourtFile(dataFile: string) {
  const courts = JSON.parse(await fs.readFile(dataFile, "utf8")) as CourtSeed[];
  const updatedCourts: CourtSeed[] = [];
  const invalidLinks: string[] = [];
  const unverifiedLinks: string[] = [];
  const validLinks: string[] = [];

  for (const court of courts) {
    const replacement = replacementBookingUrls[court.slug];
    let updatedCourt = normalizePhoneAccess({
      ...court,
      ...(replacement ?? {}),
    });

    if (isHttpUrl(updatedCourt.booking_url)) {
      const result = await verifyUrl(updatedCourt.booking_url ?? "");

      if (result.ok) {
        validLinks.push(`${updatedCourt.slug} ${result.status} ${result.finalUrl ?? updatedCourt.booking_url}`);
        updatedCourt = {
          ...updatedCourt,
          booking_url: result.finalUrl ?? updatedCourt.booking_url,
        };
      } else if (result.status === 404 || result.status === 410) {
        invalidLinks.push(
          `${updatedCourt.slug} ${updatedCourt.booking_url} -> ${result.status ?? "ERR"} ${result.reason}`
        );
        updatedCourt = {
          ...updatedCourt,
          booking_url: null,
          booking_method: updatedCourt.phone ? "phone" : null,
        };
      } else {
        unverifiedLinks.push(
          `${updatedCourt.slug} ${updatedCourt.booking_url} -> ${result.status ?? "ERR"} ${result.reason}`
        );
      }
    }

    updatedCourts.push(updatedCourt);
  }

  await fs.writeFile(dataFile, `${JSON.stringify(updatedCourts, null, 2)}\n`);

  console.log(`Verified ${path.relative(projectRoot, dataFile)}.`);
  console.log(`Valid booking links: ${validLinks.length}`);
  console.log(`Removed invalid booking links: ${invalidLinks.length}`);
  console.log(`Kept unverified booking links: ${unverifiedLinks.length}`);
  if (invalidLinks.length > 0) {
    console.log(invalidLinks.join("\n"));
  }
  if (unverifiedLinks.length > 0) {
    console.log(unverifiedLinks.join("\n"));
  }
}

async function run() {
  for (const dataFile of dataFiles) {
    await verifyCourtFile(dataFile);
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
