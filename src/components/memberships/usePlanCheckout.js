"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Single place that decides what "Choose plan" does.
 *
 * - Signed in  → /checkout?plan=<id>
 * - Signed out → /login?next=/checkout?plan=<id>, so the selected plan survives
 *   login AND registration (the register link carries the same `next`).
 *
 * The plan is validated again on the server at checkout, so the URL parameter is
 * only a navigation hint, never a pricing input.
 */
export function checkoutHrefForPlan(planId) {
  return `/checkout?plan=${encodeURIComponent(planId)}`;
}

export default function usePlanCheckout() {
  const router = useRouter();
  const { status } = useSession();
  const [pendingPlanId, setPendingPlanId] = useState(null);

  const startCheckout = useCallback(
    (planId) => {
      if (status === "loading") return;
      setPendingPlanId(planId);

      const target = checkoutHrefForPlan(planId);
      if (status === "authenticated") {
        router.push(target);
      } else {
        router.push(`/login?next=${encodeURIComponent(target)}`);
      }
    },
    [router, status],
  );

  return { startCheckout, pendingPlanId, sessionStatus: status };
}
