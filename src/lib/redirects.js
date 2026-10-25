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
  // Control characters (CR/LF/tab, NUL, DEL) are never legitimate in a path and enable header tricks.
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code < 32 || code === 127) return fallback;
  }
  return value;
}

/** Where each role lands after signing in when no (valid) destination was requested. */
const ROLE_HOME = {
  customer: { href: "/account", label: "My account" },
  staff: { href: "/staff", label: "Staff portal" },
  admin: { href: "/admin", label: "Admin dashboard" },
};

export function roleHome(role) {
  return ROLE_HOME[role] || ROLE_HOME.customer;
}

export function defaultPathForRole(role) {
  return roleHome(role).href;
}

function underPrefix(path, prefix) {
  return path === prefix || ["/", "?", "#"].some((separator) => path.startsWith(`${prefix}${separator}`));
}

/**
 * Role-aware destination check. This is a convenience so people are not sent to a
 * page that will refuse them; every protected page and API route still enforces
 * its own authorisation on the server.
 */
export function isPathAllowedForRole(path, role) {
  if (underPrefix(path, "/admin")) return role === "admin";
  if (underPrefix(path, "/staff") && !underPrefix(path, "/staff/accept-invite")) {
    return role === "staff" || role === "admin";
  }
  return true;
}

/**
 * Final post-login destination: the requested `next` path when it is a safe,
 * same-site path the role may open, otherwise the role's own home.
 */
export function resolvePostLoginPath(role, next) {
  const requested = safeNextPath(next, null);
  if (requested && !underPrefix(requested, "/login") && isPathAllowedForRole(requested, role)) {
    return requested;
  }
  return defaultPathForRole(role);
}
