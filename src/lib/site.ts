const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://padelconnect.ie";

export const SITE_URL = RAW_SITE_URL.replace(/\/$/, "");

export const SITE_NAME = "Padel Connect";

export function absoluteUrl(path: string = "/"): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalised}`;
}
