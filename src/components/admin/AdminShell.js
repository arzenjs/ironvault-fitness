import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import AdminSignOut from "@/components/admin/AdminSignOut";
import { Logo } from "@/components/ui/Logo";
import { RoleBadge } from "@/components/account/Badges";

/**
 * Dedicated admin layout: its own top bar and section navigation, separate from
 * the public site header/footer. Rendered only for a verified admin (see
 * app/admin/layout.js); each page still runs adminGuard() on its own.
 */
export default function AdminShell({ user, children }) {
  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={28} />
            <span className="hidden rounded-full border border-signal/40 bg-signal/10 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-signal-soft sm:inline-flex">
              Admin
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right md:block">
              <p className="truncate text-xs font-medium text-fog">{user.name}</p>
              <p className="truncate text-[0.6875rem] text-ash">{user.email}</p>
            </div>
            <span className="hidden sm:block">
              <RoleBadge role={user.role} />
            </span>
            <Link href="/" className="btn btn-outline btn-sm" aria-label="Back to the public website">
              <ArrowLeft size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Back to website</span>
              <span className="sm:hidden">Site</span>
            </Link>
            <AdminSignOut />
          </div>
        </div>
      </header>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AdminNav />
        </aside>
        <div className="min-w-0 pb-16">{children}</div>
      </div>
    </div>
  );
}
