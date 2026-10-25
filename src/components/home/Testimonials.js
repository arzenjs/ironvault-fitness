"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/config/testimonials";

/**
 * Horizontal testimonial rail.
 * Native scroll-snap does the heavy lifting (works with touch, trackpad and
 * keyboard); the arrow buttons just scroll the container. No carousel library.
 */
export default function Testimonials() {
  const railRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const scrollBy = (direction) => {
    const node = railRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.8;
    node.scrollBy({ left: direction * amount, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section className="section relative overflow-hidden border-t border-white/10 bg-coal" aria-labelledby="testimonials-heading">
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Member stories"
            title="What training here"
            accent="feels like"
            size="md"
            lede="What members say about the assessment, the coaching and the floor."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-fog transition hover:border-white/40 hover:bg-white/5"
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-fog transition hover:border-white/40 hover:bg-white/5"
              aria-label="Next testimonial"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1.25rem,calc((100vw-86rem)/2+clamp(1.25rem,4.5vw,4rem)))] pb-2"
        tabIndex={0}
        role="region"
        aria-label="Member testimonials, scrollable"
      >
        {testimonials.map((item, index) => (
          <motion.figure
            key={item.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-[85vw] shrink-0 snap-start flex-col justify-between rounded-[1.3rem] border border-white/10 bg-ink p-6 sm:w-[420px] md:p-7"
          >
            <Quote size={22} className="text-signal" aria-hidden="true" />
            <blockquote className="mt-5 text-[0.9375rem] leading-relaxed text-fog/90 md:text-base">
              {item.quote}
            </blockquote>
            <figcaption className="mt-6 border-t border-white/10 pt-4">
              <p className="text-sm font-semibold text-fog">{item.name}</p>
              <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">{item.context}</p>
              <p className="mt-3 text-xs text-signal">{item.highlight}</p>
            </figcaption>
          </motion.figure>
        ))}
        <div className="w-2 shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
