/**
 * Safe redirect handling.
 *
 * `next` arrives from the URL, so it is untrusted. We only accept relative
 * paths that start with a single "/" — this blocks open-redirect payloads such as
 * `//evil.com`, `/\evil.com` and `https://evil.com`.
 */
export function safeNextPath(value, fallback = "/account") {
  if (typeof value !== "string" || value.length === 0 || value.length > 300) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("://")) return fallback;
  return value;
}
