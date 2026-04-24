const FALLBACK = "/courts";

/**
 * Accept only same-origin absolute paths. Rejects protocol-relative
 * URLs (`//evil.com`), absolute URLs (`https://…`), and anything not
 * starting with a single `/`.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback: string = FALLBACK,
): string {
  if (!candidate) return fallback;
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  if (candidate.startsWith("/\\")) return fallback;
  return candidate;
}
