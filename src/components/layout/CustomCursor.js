"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Desktop-only pointer treatment: a soft red ring that trails the real cursor
 * and expands over interactive elements. The native cursor is never hidden, so
 * usability and click targets are unchanged. Disabled for touch and for
 * users who ask for reduced motion.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 420, damping: 40, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 420, damping: 40, mass: 0.35 });
  const raf = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    // Enabling happens on the first pointer frame, not synchronously in the
    // effect body, so this stays a pure subscription.
    let enabledOnce = false;

    const move = (event) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        if (!enabledOnce) {
          enabledOnce = true;
          setEnabled(true);
        }
        x.set(event.clientX);
        y.set(event.clientY);
        setVisible(true);
        const target = event.target;
        setHovering(
          Boolean(
            target instanceof Element &&
              target.closest("a, button, [role='button'], input, textarea, select, [data-cursor='grow']"),
          ),
        );
      });
    };

    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      style={{ x: springX, y: springY, opacity: visible ? 1 : 0 }}
    >
      <motion.span
        className="block rounded-full border border-signal/80"
        animate={{
          width: hovering ? 46 : 22,
          height: hovering ? 46 : 22,
          x: hovering ? -23 : -11,
          y: hovering ? -23 : -11,
          backgroundColor: hovering ? "rgba(229,35,27,0.14)" : "rgba(229,35,27,0.02)",
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}
