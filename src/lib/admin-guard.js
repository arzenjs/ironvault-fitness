import { redirect } from "next/navigation";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { HttpError, requireUser } from "@/lib/security";

/**
 * Server-side authorisation for admin pages.
 *
 * The user is re-read from MongoDB (requireUser), so a demoted or disabled admin
 * loses access immediately even if their JWT is still valid. Every admin page
 * must call adminGuard() itself: layouts and pages render independently in the
 * App Router, so a layout check alone does not protect a page's data fetching.
 */
export async function getAdminUser() {
  try {
    const user = await requireUser();
    return { user, reason: user.role === "admin" ? null : "role" };
  } catch (error) {
    if (error instanceof HttpError) {
      return { user: null, reason: error.status === 401 ? "unauthenticated" : "disabled" };
    }
    throw error; // database or configuration failure → the route's error boundary
  }
}

/**
 * Returns `{ user, denied: null }` for an admin. Otherwise signed-out visitors are
 * sent to the login page (with a safe `next`), and everyone else receives a
 * ready-to-render `denied` element — the page must return it.
 */
export async function adminGuard(returnTo = "/admin") {
  const { user, reason } = await getAdminUser();
  if (reason === "unauthenticated") redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (reason) {
    return {
      user,
      denied: <AccessDenied required="admin" area="The admin dashboard" role={user?.role} reason={reason} />,
    };
  }
  return { user, denied: null };
}
