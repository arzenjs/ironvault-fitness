"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Loader2, Sparkles } from "lucide-react";
import { formatINR, formatPlanDuration } from "@/lib/format";
import usePlanCheckout from "@/components/memberships/usePlanCheckout";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Membership card.
 *
 * Motion: staggered entrance, a pointer-following spotlight (CSS variables, no
 * React re-render per mousemove) and a subtle lift on hover. The recommended
 * plan gets a red edge glow instead of a heavier animation.
 */
export default function PlanCard({ plan, index = 0, compact = false }) {
  const { startCheckout, pendingPlanId, sessionStatus } = usePlanCheckout();
  const cardRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const isLoading = pendingPlanId === plan.id && sessionStatus !== "loading";

  const handlePointer = (event) => {
    const node = cardRef.current;
    if (!node || reduceMotion) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    node.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={handlePointer}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.08 * index }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border p-6 transition-colors duration-300 md:p-7 ${
        plan.recommended
          ? "border-signal/45 bg-gradient-to-b from-signal/[0.13] via-coal to-coal"
          : "border-white/10 bg-gradient-to-b from-white/[0.045] to-transparent hover:border-white/25"
      }`}
    >
      {/* spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), rgba(229,35,27,0.16), transparent 70%)",
        }}
      />

      {plan.recommended ? (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-signal px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-white">
          <Sparkles size={11} aria-hidden="true" /> Most picked
        </span>
      ) : null}

      <div className="relative">
        <p className="eyebrow">{formatPlanDuration(plan.durationMonths)} access</p>
        <h3 className="display mt-2 text-[1.75rem] leading-none">{plan.name}</h3>

        <div className="mt-6 flex items-end gap-2">
          <span className="display text-[2.6rem] leading-none text-fog">{formatINR(plan.pricePaise)}</span>
          <span className="pb-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ash">
            {plan.billingLabel}
          </span>
        </div>
        <p className="mt-1 text-xs text-ash">
          One-time payment · {formatPlanDuration(plan.durationMonths)} of access
        </p>

        {!compact ? <p className="mt-5 text-sm leading-relaxed text-ash">{plan.summary}</p> : null}

        <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
          {plan.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-sm text-fog/90">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  plan.recommended ? "bg-signal/20 text-signal" : "bg-white/10 text-fog/70"
                }`}
                aria-hidden="true"
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span className="leading-snug">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-7 pt-1">
        <button
          type="button"
          onClick={() => startCheckout(plan.id)}
          disabled={isLoading || sessionStatus === "loading"}
          className={`btn w-full ${plan.recommended ? "btn-primary" : "btn-outline"}`}
          aria-label={`Choose the ${plan.name} plan at ${formatINR(plan.pricePaise)}`}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" /> Opening checkout…
            </>
          ) : (
            <>
              Choose {plan.shortLabel}
              <ArrowUpRight size={15} aria-hidden="true" />
            </>
          )}
        </button>
        <p className="mt-3 text-center text-[0.6875rem] text-ash">
          Razorpay secure checkout · test mode
        </p>
      </div>
    </motion.article>
  );
}
