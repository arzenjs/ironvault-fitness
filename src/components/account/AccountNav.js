"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { RoleBadge } from "@/components/account/Badges";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/memberships", label: "Buy a plan" },
  { href: "/faq", label: "Help" },
];

/** Compact sub-navigation shown above the account content. */
export default function AccountNav({ user }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Account" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[0.8125rem] transition ${
                active ? "bg-white/10 font-medium text-fog" : "text-ash hover:text-fog"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="min-w-0 text-right sm:text-left">
          <p className="truncate text-xs font-medium text-fog">{user.name}</p>
          <p className="truncate text-[0.6875rem] text-ash">{user.email}</p>
        </div>
        <RoleBadge role={user.role} />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border border-white/15 p-2 text-ash transition hover:text-fog"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
