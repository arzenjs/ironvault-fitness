"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Word-by-word masked headline reveal.
 * Each word slides up from behind its own clip mask — the transform happens on
 * a child span, so no reflow and no layout shift.
 */
export default function SplitText({
  text,
  as = "h1",
  className = "",
  wordClassName = "",
  delay = 0.1,
  stagger = 0.075,
  duration = 0.85,
  accentWords = [],
  animateOnMount = true,
}) {
  const reduceMotion = useReducedMotion();
  const Tag = animateOnMount ? motion[as] || motion.h1 : as;
  const words = text.split(" ");

  if (reduceMotion) {
    const Plain = as;
    return (
      <Plain className={className}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className={accentWords.includes(word) ? `text-signal ${wordClassName}` : wordClassName}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </Plain>
    );
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} data-reveal="" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={`inline-block ${accentWords.includes(word) ? "text-signal" : ""} ${wordClassName}`}
            initial={{ y: "110%" }}
            animate={animateOnMount ? { y: "0%" } : undefined}
            whileInView={animateOnMount ? undefined : { y: "0%" }}
            viewport={animateOnMount ? undefined : { once: true, amount: 0.6 }}
            transition={{ duration, ease: EASE_OUT_EXPO, delay: delay + i * stagger }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
