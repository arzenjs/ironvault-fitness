/**
 * Shared Framer Motion (package: `motion`) variants and easings.
 * Keeping them here means every section animates with the same timing language
 * instead of each component inventing its own curve.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
export const EASE_SOFT = [0.22, 0.61, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
};

export const blurUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: EASE_OUT_EXPO } },
};

export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

/** Words rise from behind a mask — used for the hero headline. */
export const wordReveal = {
  hidden: { y: "105%" },
  show: (i = 0) => ({
    y: "0%",
    transition: { duration: 0.85, ease: EASE_OUT_EXPO, delay: 0.12 + i * 0.075 },
  }),
};

/** Viewport config reused by every scroll reveal. */
export const viewportOnce = { once: true, amount: 0.25 };
export const viewportSoft = { once: true, amount: 0.12 };

/** Narrow-screen detection for lighter motion (no cursor, reduced parallax). */
export const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;
