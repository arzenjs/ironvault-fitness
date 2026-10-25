"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeIndianRupee, ClipboardList, LayoutDashboard, Mail, ShieldCheck, Users } from "lucide-react";

export const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/users", label: "Accounts", icon: ShieldCheck },
  { href: "/admin/staff", label: "Staff & invites", icon: Mail },
  { href: "/admin/payments", label: "Payments", icon: BadgeIndianRupee },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardList },
];

/**
 * Admin navigation: a vertical sidebar from `lg` up, and a horizontally scrollable
 * pill bar below it — every section stays reachable on a phone.
 */
export default function AdminNav() {
  const pathname = usePathname() || "";

  return (
    <nav aria-label="Admin sections">
      <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {adminLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[0.8125rem] transition lg:rounded-xl lg:px-3 ${
                  active
                    ? "bg-white/10 font-medium text-fog ring-1 ring-white/10"
                    : "text-ash hover:bg-white/[0.04] hover:text-fog"
                }`}
              >
                <Icon size={15} className={active ? "text-signal" : ""} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
