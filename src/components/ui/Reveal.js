"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO, viewportOnce } from "@/lib/motion";

/**
 * Scroll reveal used across the site. Content is visible by default if the
 * animation never runs (motion respects reduced motion and initial styles are
 * only applied when motion is allowed).
 *
 * variant: "up" | "fade" | "blur" | "scale" | "left" | "right"
 */
const variants = {
  up: { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  blur: { hidden: { opacity: 0, y: 16, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } },
  scale: { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } },
  left: { hidden: { opacity: 0, x: -22 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 22 }, show: { opacity: 1, x: 0 } },
};

export default function Reveal({
  children,
  as = "div",
  variant = "up",
  delay = 0,
  duration = 0.7,
  className = "",
  amount = 0.12,
  once = true,
  ...rest
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduceMotion) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants[variant] || variants.up}
      transition={{ duration, ease: EASE_OUT_EXPO, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
