"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { facilities } from "@/config/facilities";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Facilities preview with a hover/focus-driven image panel on desktop.
 * The list is keyboard navigable (each row is a link) and the panel swap is a
 * cross-fade, not a layout change. On mobile the images live inside each row.
 */
export default function FacilitiesPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = facilities[activeIndex];

  return (
    <section className="section relative bg-ink" aria-labelledby="facilities-heading">
      <div className="shell">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The floor"
            title="Built around five"
            accent="training zones"
            lede="Every zone has a purpose and a rule. Plates get re-racked, platforms stay clear, and the cardio line faces the windows so morning sessions do not feel like a basement."
            size="md"
          />
          <Link href="/facilities" className="btn btn-outline shrink-0 self-start md:self-auto">
            All facilities
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
          {/* list */}
          <ul className="border-t border-white/10">
            {facilities.map((facility, index) => (
              <li key={facility.id} className="border-b border-white/10">
                <Link
                  href="/facilities"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className="group relative flex items-start gap-4 py-6 transition-colors md:gap-6"
                >
                  <span
                    className={`mt-1 font-mono text-[0.625rem] tracking-[0.2em] transition-colors ${
                      activeIndex === index ? "text-signal" : "text-ash/60"
                    }`}
                  >
                    {facility.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-4">
                      <span
                        className={`display text-[clamp(1.35rem,2.6vw,2rem)] leading-none transition-colors ${
                          activeIndex === index ? "text-fog" : "text-fog/60"
                        }`}
                      >
                        {facility.title}
                      </span>
                      <ArrowUpRight
                        size={18}
                        className={`shrink-0 transition-all duration-300 ${
                          activeIndex === index
                            ? "translate-x-0 text-signal opacity-100"
                            : "-translate-x-1 text-ash opacity-0 md:opacity-40"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-2 block max-w-md text-sm leading-relaxed text-ash">{facility.summary}</span>
                    {/* mobile image */}
                    <span className="mt-4 block overflow-hidden rounded-xl lg:hidden">
                      <SmartImage
                        src={facility.image.src}
                        alt={facility.image.alt}
                        sizes="(max-width: 1024px) 90vw, 0px"
                        className="aspect-[16/10] w-full"
                        imgClassName="object-cover"
                      />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* sticky preview (desktop only) */}
          <div className="relative hidden lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-graphite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    className="absolute inset-0"
                  >
                    <SmartImage
                      src={active.image.src}
                      alt={active.image.alt}
                      sizes="(min-width: 1024px) 40vw, 0px"
                      className="h-full w-full"
                      imgClassName="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-signal">
                    Zone {active.number}
                  </p>
                  <p className="display mt-2 text-2xl">{active.title}</p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {active.details.slice(0, 2).map((detail) => (
                      <li key={detail} className="text-[0.6875rem] text-ash">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-center font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ash/60">
                Hover a zone to preview
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
