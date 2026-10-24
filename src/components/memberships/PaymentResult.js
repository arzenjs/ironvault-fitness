"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Loader2, RefreshCw, XCircle } from "lucide-react";
import { formatINR, formatDateTime } from "@/lib/format";
import { paymentStatusMeta } from "@/lib/format";

/**
 * Result screen for a checkout attempt.
 *
 * It polls our own status endpoint (never Razorpay directly) because the
 * authoritative confirmation may arrive by webhook a few seconds after the
 * browser returns. It stops polling after ~60s and offers a manual refresh.
 */
const MAX_POLLS = 12;

export default function PaymentResult({ initialPayment, paymentRef }) {
  const [payment, setPayment] = useState(initialPayment);
  const [polls, setPolls] = useState(0);
  const [checking, setChecking] = useState(false);
  const timer = useRef(null);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch(`/api/payments/status?ref=${encodeURIComponent(paymentRef)}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setPayment(data.payment);
      }
    } catch {
      // Silent: the poll will simply try again.
    } finally {
      setChecking(false);
      setPolls((count) => count + 1);
    }
  }, [paymentRef]);

  useEffect(() => {
    const settled = ["successful", "failed", "abandoned", "review"].includes(payment?.status);
    if (settled || polls >= MAX_POLLS) return;
    timer.current = setTimeout(refresh, polls === 0 ? 1500 : 4000);
    return () => clearTimeout(timer.current);
  }, [payment?.status, polls, refresh]);

  const status = payment?.status || "pending";
  const settled = ["successful", "failed", "abandoned", "review"].includes(status);
  const meta = paymentStatusMeta[status] || paymentStatusMeta.pending;

  const view = {
    successful: {
      icon: CheckCircle2,
      tone: "text-emerald-400",
      ring: "border-emerald-400/35 bg-emerald-400/10",
      title: "Membership active",
      description: "Payment verified. Your plan is live and the confirmation email is on its way.",
    },
    pending: {
      icon: Clock3,
      tone: "text-amber-300",
      ring: "border-amber-300/35 bg-amber-300/10",
      title: "Waiting for confirmation",
      description:
        "Razorpay has not confirmed this payment to our server yet. This usually takes a few seconds.",
    },
    created: {
      icon: Clock3,
      tone: "text-amber-300",
      ring: "border-amber-300/35 bg-amber-300/10",
      title: "Checkout not completed",
      description: "This order was created but payment was not started.",
    },
    failed: {
      icon: XCircle,
      tone: "text-red-400",
      ring: "border-red-400/35 bg-red-400/10",
      title: "Payment failed",
      description: "No membership was activated and nothing further will be charged for this attempt.",
    },
    abandoned: {
      icon: XCircle,
      tone: "text-ash",
      ring: "border-white/20 bg-white/5",
      title: "Payment not completed",
      description: "The checkout window closed before the payment finished. You can start a new attempt.",
    },
    review: {
      icon: AlertCircle,
      tone: "text-amber-300",
      ring: "border-amber-300/35 bg-amber-300/10",
      title: "Payment under review",
      description:
        "Something in the payment details did not match the order, so it has been flagged for the team. Nothing was activated automatically.",
    },
  }[status] || null;

  const Icon = view?.icon || Clock3;

  return (
    <div className="mx-auto max-w-2xl">
      <div className={`rounded-[1.4rem] border p-6 md:p-8 ${view.ring}`}>
        <div className="flex items-start gap-4">
          <span className={`mt-0.5 ${view.tone}`}>
            {!settled ? (
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            ) : (
              <Icon size={28} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <h1 className="display text-[clamp(1.8rem,4vw,2.6rem)] text-fog">{view.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-fog/80">{view.description}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-2 border-t border-white/15 pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-fog/60">Plan</dt>
            <dd className="text-right font-medium text-fog">{payment?.planName || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fog/60">Amount</dt>
            <dd className="font-medium text-fog">{payment ? formatINR(payment.amountPaise) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fog/60">Status</dt>
            <dd className="font-mono text-xs uppercase tracking-[0.12em] text-fog">{meta.label}</dd>
          </div>
          {payment?.razorpayPaymentId ? (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-fog/60">Payment reference</dt>
              <dd className="break-all font-mono text-xs text-fog">{payment.razorpayPaymentId}</dd>
            </div>
          ) : null}
          {payment?.razorpayOrderId ? (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-fog/60">Order reference</dt>
              <dd className="break-all font-mono text-xs text-fog/80">{payment.razorpayOrderId}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-fog/60">Created</dt>
            <dd className="font-mono text-xs text-fog/80">{formatDateTime(payment?.createdAt)}</dd>
          </div>
        </dl>

        {!settled ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={refresh} className="btn btn-light btn-sm" disabled={checking}>
              {checking ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Checking…
                </>
              ) : (
                <>
                  <RefreshCw size={14} aria-hidden="true" /> Check again
                </>
              )}
            </button>
            <p className="text-xs text-fog/60" role="status">
              {polls >= MAX_POLLS
                ? "Still pending. Your membership will update automatically once Razorpay confirms — check your account in a minute or contact the front desk."
                : "Checking automatically…"}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/account" className="btn btn-primary flex-1">
          Go to my account <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link href="/memberships" className="btn btn-outline flex-1">
          {status === "successful" ? "Buy another plan" : "Try again"}
        </Link>
      </div>

      {status === "successful" ? (
        <p className="mt-5 text-center text-xs leading-relaxed text-ash">
          If the confirmation email does not arrive within a few minutes, check your spam folder — the
          membership is already active in your account.
        </p>
      ) : null}
    </div>
  );
}
