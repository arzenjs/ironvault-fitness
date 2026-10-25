"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";

/**
 * Wraps pages in the public site chrome (header + footer) — except the admin
 * dashboard, which ships its own shell and navigation (app/admin/layout.js).
 * The footer is passed in as a prop so it can stay a Server Component.
 */
export default function SiteChrome({ footer, children }) {
  const pathname = usePathname() || "";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminArea) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content">{children}</main>
      {footer}
    </>
  );
}
