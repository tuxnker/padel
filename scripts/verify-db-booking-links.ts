import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import type { BookingMethod, Court } from "../src/types";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

type CourtRow = Pick<Court, "id" | "slug" | "name" | "booking_url" | "booking_method" | "phone">;

type VerificationResult = {
  ok: boolean;
  status: number | null;
  finalUrl: string | null;
  reason: string;
};

const phoneOverrides: Record<string, string> = {
  "cavan-lawn-tennis-padel-club": "083 453 2618",
  "rockbrook-padel": "01 548 8166",
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function requestUrl(url: string, method: "HEAD" | "GET", timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "OMPlayerDbLinkVerifier/1.0 (+https://omplayer.app)",
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

function isHttpUrl(url: string | null) {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function fallbackBookingMethod(phone: string | null): BookingMethod | null {
  return phone ? "phone" : null;
}

async function run() {
  const { data, error } = await supabase
    .from("courts")
    .select("id, slug, name, booking_url, booking_method, phone")
    .order("name");

  if (error) {
    throw new Error(`Failed to read courts from DB: ${error.message}`);
  }

  const courts = (data ?? []) as CourtRow[];
  let valid = 0;
  let removed = 0;
  let updatedFinalUrls = 0;
  let phoneFixed = 0;
  const unverified: string[] = [];

  for (const court of courts) {
    const phone = phoneOverrides[court.slug] ?? court.phone;
    const baseUpdate: Partial<CourtRow> = {};

    if (phone !== court.phone) {
      baseUpdate.phone = phone;
      phoneFixed += 1;
    }

    if (!isHttpUrl(court.booking_url)) {
      if (!court.booking_url && phone && court.booking_method !== "phone") {
        baseUpdate.booking_method = "phone";
      }

      if (Object.keys(baseUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from("courts")
          .update(baseUpdate)
          .eq("id", court.id);

        if (updateError) {
          throw new Error(`Failed to update ${court.slug}: ${updateError.message}`);
        }
      }

      continue;
    }

    const result = await verifyUrl(court.booking_url ?? "");

    if (result.ok) {
      valid += 1;
      const finalUrl = result.finalUrl ?? court.booking_url;
      const shouldUpdateFinalUrl = finalUrl !== court.booking_url;

      if (Object.keys(baseUpdate).length > 0 || shouldUpdateFinalUrl) {
        const { error: updateError } = await supabase
          .from("courts")
          .update({
            ...baseUpdate,
            ...(shouldUpdateFinalUrl ? { booking_url: finalUrl } : {}),
          })
          .eq("id", court.id);

        if (updateError) {
          throw new Error(`Failed to update ${court.slug}: ${updateError.message}`);
        }

        if (shouldUpdateFinalUrl) updatedFinalUrls += 1;
      }

      continue;
    }

    if (result.status === 404 || result.status === 410) {
      const { error: updateError } = await supabase
        .from("courts")
        .update({
          ...baseUpdate,
          booking_url: null,
          booking_method: fallbackBookingMethod(phone),
        })
        .eq("id", court.id);

      if (updateError) {
        throw new Error(`Failed to remove dead booking URL for ${court.slug}: ${updateError.message}`);
      }

      removed += 1;
      console.log(`Removed ${court.slug}: ${court.booking_url} -> ${result.status}`);
      continue;
    }

    unverified.push(`${court.slug}: ${court.booking_url} -> ${result.status ?? "ERR"} ${result.reason}`);

    if (Object.keys(baseUpdate).length > 0) {
      const { error: updateError } = await supabase
        .from("courts")
        .update(baseUpdate)
        .eq("id", court.id);

      if (updateError) {
        throw new Error(`Failed to update ${court.slug}: ${updateError.message}`);
      }
    }
  }

  console.log(`DB courts checked: ${courts.length}`);
  console.log(`Valid booking links: ${valid}`);
  console.log(`Removed confirmed dead links: ${removed}`);
  console.log(`Updated redirected final URLs: ${updatedFinalUrls}`);
  console.log(`Phone fixes applied: ${phoneFixed}`);
  console.log(`Kept unverified links: ${unverified.length}`);
  if (unverified.length > 0) console.log(unverified.join("\n"));
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
