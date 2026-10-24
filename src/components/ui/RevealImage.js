"use client";

import { motion, useReducedMotion } from "motion/react";
import SmartImage from "@/components/ui/SmartImage";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Image reveal: a curtain wipes away while the photograph scales from 1.12 to
 * 1. Both are transform/opacity only. `priority` is forwarded so hero images
 * can preload.
 */
export default function RevealImage({
  src,
  alt,
  width,
  height,
  fill = true,
  sizes = "100vw",
  priority = false,
  className = "",
  imgClassName = "",
  direction = "up",
  delay = 0,
  zoom = true,
  rounded = "rounded-2xl",
}) {
  const reduceMotion = useReducedMotion();

  const curtain = {
    up: { initial: { scaleY: 1, originY: 0 }, animate: { scaleY: 0, originY: 0 } },
    left: { initial: { scaleX: 1 }, animate: { scaleX: 0 } },
  }[direction];

  if (reduceMotion) {
    return (
      <SmartImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`${rounded} ${className}`}
        imgClassName={imgClassName}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      <motion.div
        initial={{ scale: zoom ? 1.12 : 1 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.25, ease: EASE_OUT_EXPO, delay }}
        className="h-full w-full"
      >
        <SmartImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          className="h-full w-full"
          imgClassName={imgClassName}
        />
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={curtain.initial}
        whileInView={curtain.animate}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: delay + 0.05 }}
        className="pointer-events-none absolute inset-0 origin-top bg-ink"
      />
    </div>
  );
}
