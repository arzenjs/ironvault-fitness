"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Route transition. A template re-mounts on navigation, so `key={pathname}`
 * gives every page a short, non-blocking entrance. It fades opacity only —
 * no layout animation, so there is no content shift and the page is usable
 * from the first frame.
 */
export default function Template({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return children;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
