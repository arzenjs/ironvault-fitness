import { auth } from "@/lib/auth";

/**
 * Server-side session reader used by layouts and pages.
 * Returns null instead of throwing when the database is unreachable, so public
 * pages still render if Mongo is down (only the account area degrades).
 */
export async function getSessionUser() {
  try {
    const session = await auth();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role || "customer",
      status: session.user.status || "active",
    };
  } catch {
    return null;
  }
}

export async function getSessionSafe() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
