const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://omplayer.app";

export const SITE_URL = RAW_SITE_URL.replace(/\/$/, "");

export const SITE_NAME = "OM Player";
export const SITE_TAGLINE = "Find one more player. Fill games. Play more.";

export const BRAND_COLORS = {
  deepNavy: "#0B1220",
  cardNavy: "#111B2D",
  borderNavy: "#253149",
  emerald: "#00E6B2",
  lime: "#C6FF00",
  white: "#FFFFFF",
  muted: "#A8B3C2",
  softMist: "#EEF7F2",
  slate: "#5D6875",
} as const;

export function absoluteUrl(path: string = "/"): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalised}`;
}
