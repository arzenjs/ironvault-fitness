import AdminShell from "@/components/admin/AdminShell";
import { getAdminUser } from "@/lib/admin-guard";

export const metadata = {
  title: { default: "Admin dashboard", template: "%s · Admin · IronVault" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Admin shell. The admin chrome (navigation, account details) is rendered only for
 * a verified admin. For everyone else the children render on their own and show
 * the sign-in redirect or an access-denied screen, so nothing about the admin
 * area leaks. This layout is NOT the security boundary: each page and API route
 * enforces admin access itself.
 */
export default async function AdminLayout({ children }) {
  const { user, reason } = await getAdminUser();
  if (reason) return children;
  return <AdminShell user={user}>{children}</AdminShell>;
}
