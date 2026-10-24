"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, Phone, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { mainNav } from "@/config/navigation";
import { gym, whatsappUrl } from "@/config/gym";

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  // The overlay remembers which route it was opened on, so a navigation closes
  // it without needing an effect that calls setState.
  const [menuState, setMenuState] = useState({ open: false, path: pathname });
  const menuOpen = menuState.open && menuState.path === pathname;
  const setMenuOpen = useCallback((open) => setMenuState({ open, path: pathname }), [pathname]);
  const user = session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-fog focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-500 ${
          scrolled || menuOpen
            ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-ink/80 to-transparent"
        }`}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-4 md:h-[76px]">
          <Logo size={32} />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors ${
                    active ? "text-fog" : "text-ash hover:text-fog"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            {status === "loading" ? (
              <span className="h-9 w-24 animate-pulse rounded-full bg-white/10" aria-hidden="true" />
            ) : user ? (
              <>
                <Link href="/account" className="btn btn-ghost btn-sm">
                  <LayoutDashboard size={15} aria-hidden="true" />
                  My account
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full p-2.5 text-ash transition hover:bg-white/10 hover:text-fog"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="link-underline px-2 py-2 text-[0.8125rem] font-medium text-ash hover:text-fog">
                  Log in
                </Link>
                <Link href="/memberships" className="btn btn-primary btn-sm">
                  Join IronVault
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="relative z-[95] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-fog lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence initial={false} mode="wait">
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={19} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={19} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="fixed inset-0 z-[75] flex flex-col bg-ink lg:hidden"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          >
            <div className="grain pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative flex h-full flex-col overflow-y-auto pb-8 pt-[86px]">
              <nav aria-label="Mobile" className="shell flex flex-col">
                {mainNav.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.055, duration: 0.5, ease: EASE_OUT_EXPO }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between border-b border-white/10 py-4"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="display font-display text-[2rem] leading-none text-fog group-active:text-signal">
                        {item.label}
                      </span>
                      <span className="font-mono text-[0.625rem] text-ash">0{index + 1}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: EASE_OUT_EXPO }}
                className="shell mt-8 flex flex-col gap-3"
              >
                {user ? (
                  <>
                    <Link href="/account" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>
                      <User size={16} aria-hidden="true" /> My account
                    </Link>
                    <button type="button" className="btn btn-outline w-full" onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut size={16} aria-hidden="true" /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/memberships" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>
                      Join IronVault <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                    <Link href="/login" className="btn btn-outline w-full" onClick={() => setMenuOpen(false)}>
                      Log in
                    </Link>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="shell mt-auto pt-10 text-sm text-ash"
              >
                <a href={gym.phoneHref} className="flex items-center gap-2 py-1 hover:text-fog">
                  <Phone size={14} aria-hidden="true" /> {gym.phone}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="py-1 hover:text-fog">
                  WhatsApp us
                </a>
                <p className="mt-3 max-w-xs text-xs leading-relaxed">
                  {gym.address.line1}, {gym.address.line2}
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
