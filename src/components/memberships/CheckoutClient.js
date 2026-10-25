"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { formatINR, formatPlanDuration } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

/**
 * Razorpay Checkout driver.
 *
 * Flow: create order (server) → open Checkout → on success send the signature to
 * /api/payments/verify → navigate to the result page, which polls until the
 * verified state lands.
 *
 * Notes:
 *  - We never read card data; Checkout is hosted by Razorpay in an iframe.
 *  - `handler` returning success does not activate anything by itself; the server
 *    re-verifies the signature and confirms the payment with Razorpay.
 *  - If the customer closes the modal we mark the attempt "abandoned" for the
 *    dashboard, but a late capture will still be honoured by the webhook.
 */
export default function CheckoutClient({ plan, user, razorpayConfigured }) {
  const router = useRouter();
  const { toast } = useToast();
  // Set by the <Script> onLoad handler; window.Razorpay is checked at click time
  // as the authoritative signal.
  const [, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | creating | open | verifying
  const [error, setError] = useState("");
  const paymentRef = useRef(null);

  const launchCheckout = useCallback(
    async () => {
      setError("");

      if (!razorpayConfigured) {
        setError(
          "Online payments are not configured on this deployment. Add Razorpay test keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) to enable checkout.",
        );
        return;
      }
      if (!window.Razorpay) {
        setScriptError(true);
        setError("The Razorpay checkout script could not be loaded. Check your connection and reload the page.");
        return;
      }

      setStatus("creating");
      try {
        const response = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan.id }),
        });
        const order = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus("idle");
          setError(order.error || "We could not start the payment. Please try again.");
          return;
        }

        paymentRef.current = order.paymentRecordId;

        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: "IronVault Fitness",
          description: `${order.plan.name} · ${formatPlanDuration(order.plan.durationMonths)}`,
          prefill: { name: order.prefill.name, email: order.prefill.email },
          notes: { planId: plan.id },
          theme: { color: "#e5231b" },
          modal: {
            ondismiss: async () => {
              setStatus("idle");
              toast({
                tone: "info",
                title: "Payment not completed",
                description: "No money was taken. You can retry whenever you are ready.",
              });
              if (paymentRef.current) {
                // Best-effort bookkeeping only — never activates anything.
                fetch("/api/payments/abandon", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentRecordId: paymentRef.current }),
                }).catch(() => {});
              }
              router.push(`/checkout/result?ref=${paymentRef.current}`);
            },
          },
          handler: async (response) => {
            setStatus("verifying");
            try {
              const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentRecordId: paymentRef.current,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verified = await verifyResponse.json().catch(() => ({}));

              if (!verifyResponse.ok) {
                // Signature/verification failed: show the reason and let the result
                // page poll, in case the webhook resolves it asynchronously.
                setStatus("idle");
                setError(verified.error || "We could not verify this payment yet.");
              }
              router.push(`/checkout/result?ref=${paymentRef.current}`);
            } catch {
              setStatus("idle");
              setError("Verification request failed. Your payment may still be processing — check your account shortly.");
              router.push(`/checkout/result?ref=${paymentRef.current}`);
            }
          },
        });

        checkout.on("payment.failed", (payload) => {
          const description = payload?.error?.description || "The payment did not go through.";
          setError(description);
          toast({ tone: "error", title: "Payment failed", description });
        });

        checkout.open();
        setStatus("open");
      } catch {
        setStatus("idle");
        setError("Network error while starting the payment. Please try again.");
      }
    },
    [plan.id, razorpayConfigured, router, toast],
  );

  const busy = status === "creating" || status === "verifying";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />

      {/* order summary */}
      <section aria-labelledby="summary-heading" className="order-2 lg:order-1">
        <div className="card overflow-hidden">
          <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <h2 id="summary-heading" className="eyebrow">
              Order summary
            </h2>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-fog">{plan.name}</p>
                <p className="mt-1 text-xs text-ash">
                  {formatPlanDuration(plan.durationMonths)} access · one-time payment
                </p>
              </div>
              <p className="display whitespace-nowrap text-2xl text-fog">{formatINR(plan.pricePaise)}</p>
            </div>

            <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-ash">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ash">Subtotal</dt>
                <dd className="text-fog">{formatINR(plan.pricePaise)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ash">Taxes</dt>
                <dd className="text-ash">Included in price</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="font-semibold text-fog">Total due today</dt>
                <dd className="display text-xl text-fog">{formatINR(plan.pricePaise)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-coal px-4 py-3 text-xs leading-relaxed text-ash">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
          <p>
            Your membership activates only after the payment signature is verified and Razorpay confirms the
            payment. Closing the browser after paying will not cancel the purchase.
          </p>
        </div>
      </section>

      {/* payment panel */}
      <section aria-labelledby="pay-heading" className="order-1 lg:order-2">
        <div className="card p-5 md:p-6">
          <h2 id="pay-heading" className="display text-2xl">
            Secure payment
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ash">
            You will pay as <span className="text-fog">{user.email}</span>. Card details are entered on
            Razorpay&apos;s hosted checkout — this site never sees them.
          </p>

          <dl className="mt-5 space-y-2 rounded-xl border border-white/10 bg-ink px-4 py-3 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-ash">Mode</dt>
              <dd className="font-mono text-fog">Razorpay test</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ash">Currency</dt>
              <dd className="font-mono text-fog">INR</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ash">Billing</dt>
              <dd className="font-mono text-fog">One-time</dd>
            </div>
          </dl>

          {!razorpayConfigured ? (
            <p className="mt-5 flex items-start gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              Razorpay keys are not configured on this deployment, so checkout is disabled. The rest of the
              site and your account work normally.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-sm text-red-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          {scriptError ? (
            <p className="mt-3 text-[0.6875rem] text-ash">
              If the script is blocked by an extension, open the site in a private window and try again.
            </p>
          ) : null}

          <button
            type="button"
            onClick={launchCheckout}
            disabled={busy || !razorpayConfigured}
            className="btn btn-primary mt-5 w-full"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                {status === "verifying" ? "Verifying payment…" : "Opening checkout…"}
              </>
            ) : (
              <>
                <Lock size={15} aria-hidden="true" /> Pay {formatINR(plan.pricePaise)}
              </>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.6875rem] text-ash">
            <CreditCard size={12} aria-hidden="true" /> UPI, cards, net banking and wallets
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link href="/memberships" className="inline-flex items-center gap-1.5 text-ash transition hover:text-fog">
            <ArrowLeft size={13} aria-hidden="true" /> Change plan
          </Link>
          <Link href="/terms" className="text-ash underline decoration-white/20 underline-offset-4 hover:text-fog">
            Payment terms
          </Link>
        </div>
      </section>
    </div>
  );
}
