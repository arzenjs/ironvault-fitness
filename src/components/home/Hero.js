"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Play, Star } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { media } from "@/config/media";
import { gym } from "@/config/gym";

/**
 * Hero motion concept:
 *  - words rise from individual masks (staggered),
 *  - supporting copy and CTAs follow with a short delay,
 *  - the photo column parallaxes on scroll and scales in from 1.06,
 *  - a red "load" line draws itself, and the scroll cue loops.
 * Everything is transform/opacity, so the first viewport stays cheap and there is
 * no intro overlay that blocks the page.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "12%"]);
  const backY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "-8%"]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.85], [1, reduceMotion ? 1 : 0.35]);

  const line1 = ["BUILT", "FOR", "STRENGTH."];
  const line2 = ["DESIGNED", "FOR", "PROGRESS."];

  return (
    <section
      ref={containerRef}
      className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32"
      aria-labelledby="hero-heading"
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-ink" aria-hidden="true" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-[0.55]" aria-hidden="true" />
      <div className="radial-fade absolute inset-x-0 top-0 -z-10 h-[70vh]" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.55] mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 78% 18%, rgba(229,35,27,0.20), transparent 70%), radial-gradient(40% 40% at 12% 82%, rgba(240,163,94,0.10), transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div className="grain absolute inset-0 -z-10" aria-hidden="true" />

      <div className="shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-16">
          {/* ---------------- copy ---------------- */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fog/80">
                  Fraser Road · Patna
                </span>
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ash">
                Strength-first since {gym.established}
              </span>
            </motion.div>

            <h1 id="hero-heading" className="display-tight mt-7 text-[clamp(2.55rem,6.9vw,6.2rem)]">
              <span className="sr-only">Built for Strength. Designed for Progress.</span>
              <span aria-hidden="true" className="block">
                {line1.map((word, index) => (
                  <Word key={word} index={index} accent={word === "STRENGTH."}>
                    {word}
                  </Word>
                ))}
              </span>
              <span aria-hidden="true" className="mt-1 block text-fog/95">
                {line2.map((word, index) => (
                  <Word key={word} index={index + 3} outline={word === "PROGRESS."}>
                    {word}
                  </Word>
                ))}
              </span>
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.85, duration: 1, ease: EASE_OUT_EXPO }}
              className="mt-7 h-px w-full origin-left bg-gradient-to-r from-signal via-signal/40 to-transparent"
              aria-hidden="true"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: EASE_OUT_EXPO }}
              className="lede mt-6 max-w-lg"
            >
              A premium training floor built around the barbell: calibrated plates, coached programming and a
              room that respects your session. No queues at the racks, no noise between sets.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.7, ease: EASE_OUT_EXPO }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link href="/memberships" className="btn btn-primary group w-full sm:w-auto">
                Join IronVault
                <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link href="/facilities" className="btn btn-outline group w-full sm:w-auto">
                <Play size={14} aria-hidden="true" />
                See the floor
                <ArrowDownRight size={16} className="opacity-60 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6"
            >
              <div>
                <dt className="eyebrow">Open today</dt>
                <dd className="mt-1 font-mono text-sm text-fog">5:30 AM – 10:00 PM</dd>
              </div>
              <div>
                <dt className="eyebrow">Plans from</dt>
                <dd className="mt-1 font-mono text-sm text-fog">₹1,499 / month</dd>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={12} className="fill-signal text-signal" />
                  ))}
                </span>
                <span className="text-xs text-ash">
                  Demo reviews <span className="sr-only">fictional sample content</span>
                </span>
              </div>
            </motion.dl>
          </div>

          {/* ---------------- imagery ---------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
          >
            <motion.div style={{ y: backY }} className="relative">
              {/* back strip */}
              <div className="absolute -left-4 top-8 hidden h-[62%] w-[38%] overflow-hidden rounded-2xl border border-white/10 sm:block">
                <SmartImage
                  src={media.hero.aisle.src}
                  alt=""
                  sizes="(max-width: 1024px) 30vw, 220px"
                  className="h-full w-full opacity-70"
                  imgClassName="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden="true" />
              </div>

              {/* main portrait */}
              <div className="relative ml-auto w-[86%] sm:w-[78%]">
                <div className="absolute -inset-[1px] rounded-[1.35rem] bg-gradient-to-b from-white/25 via-white/5 to-transparent" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[1.3rem] bg-graphite">
                  <motion.div style={{ y: imageY }} className="relative aspect-[4/5] w-full">
                    <SmartImage
                      src={media.hero.athlete.src}
                      alt={media.hero.athlete.alt}
                      priority
                      sizes="(max-width: 640px) 86vw, (max-width: 1024px) 60vw, 420px"
                      className="h-full w-full"
                      imgClassName="object-cover object-[58%_35%]"
                    />
                  </motion.div>
                  <motion.div
                    style={{ opacity: fadeOut }}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
                    aria-hidden="true"
                  />

                  {/* caption */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <div>
                      <p className="font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-signal">Live from the floor</p>
                      <p className="mt-1 text-sm font-medium text-fog">Heavy pull day · Rack 03</p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-ink/50 backdrop-blur">
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>

              {/* floating stat */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.7, ease: EASE_OUT_EXPO }}
                className="absolute -bottom-6 left-0 hidden w-[190px] rounded-2xl border border-white/12 bg-coal/95 p-4 shadow-2xl backdrop-blur sm:block sm:-left-6"
              >
                <p className="eyebrow">Squat platforms</p>
                <p className="display mt-1 text-3xl">04</p>
                <p className="mt-1 text-[0.6875rem] leading-snug text-ash">Calibrated bars, bumper plates, no waiting.</p>
              </motion.div>

              {/* accent rail */}
              <div className="absolute -right-2 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-signal/70 to-transparent lg:block" aria-hidden="true" />
              <div className="absolute -right-2 top-[18%] hidden -translate-y-1/2 rotate-90 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-ash lg:block">
                EST. {gym.established}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <div className="mt-14 flex items-center justify-between gap-6 border-t border-white/10 pt-6 md:mt-20">
          <a
            href="#brand-statement"
            className="group flex items-center gap-3 text-ash transition-colors hover:text-fog"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20">
              <motion.span
                aria-hidden="true"
                animate={reduceMotion ? undefined : { y: [-10, 10, -10] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDownRight size={15} />
              </motion.span>
            </span>
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.24em]">Scroll to explore</span>
          </a>
          <p className="hidden max-w-[16rem] text-right text-[0.6875rem] leading-relaxed text-ash/70 md:block">
            Demo site · fictional gym · Razorpay test-mode payments
          </p>
        </div>
      </div>
    </section>
  );
}

function Word({ children, index, accent = false, outline = false }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
      <motion.span
        className={`inline-block ${accent ? "text-signal" : ""} ${outline ? "text-stroke" : ""}`}
        initial={{ y: "108%", rotate: 2 }}
        animate={{ y: "0%", rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.18 + index * 0.085 }}
      >
        {children}
        {"\u00A0"}
      </motion.span>
    </span>
  );
}
