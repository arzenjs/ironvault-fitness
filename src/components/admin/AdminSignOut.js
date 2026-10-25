"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-white/15 p-2.5 text-ash transition hover:text-fog"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut size={15} />
    </button>
  );
}
