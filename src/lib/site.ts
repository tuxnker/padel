const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://omplayer.app";

export const SITE_URL = RAW_SITE_URL.replace(/\/$/, "");

export const SITE_NAME = "OM Player";
export const SITE_TAGLINE = "Find one more player. Fill games. Play more.";

export const BRAND_COLORS = {
  deepNavy: "#0B1220",
  emerald: "#00E6B2",
  white: "#FFFFFF",
  lime: "#C6FF00",
} as const;

export function absoluteUrl(path: string = "/"): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalised}`;
}
