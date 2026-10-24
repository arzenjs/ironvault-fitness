import { NextResponse } from "next/server";

/**
 * Route guard (Next.js 16 "proxy" — the renamed middleware convention).
 *
 * This only performs a *cheap redirect* for visitors with no session cookie, so
 * they land on the login page with the intended destination preserved. It is NOT
 * the authorisation boundary:
 *
 *   - it never trusts the JWT payload for role decisions,
 *   - every protected page re-reads the user from MongoDB,
 *   - every API route calls requireUser()/requireRole() on the server.
 *
 * That layering means a tampered or stale cookie cannot grant access, and a
 * missing proxy (e.g. a misconfigured deployment) cannot open a hole either.
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  const hasSessionCookie =
    request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");

  if (hasSessionCookie) return NextResponse.next();

  const isProtected =
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin");

  // The invitation acceptance page is public — it is guarded by a token instead.
  if (pathname.startsWith("/staff/accept-invite")) return NextResponse.next();

  if (isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/staff/:path*", "/admin/:path*"],
};
