"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

/**
 * Staff recovery action for a stuck payment.
 * It asks the server to query Razorpay — staff cannot declare success directly.
 */
export default function ReconcileButton({ paymentId }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const run = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/staff/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast({ tone: "error", title: "Reconcile failed", description: data.error || "Try again shortly." });
        return;
      }
      if (data.ok && data.status === "successful") {
        toast({ tone: "success", title: "Payment confirmed", description: "Razorpay shows a captured payment. Membership activated." });
      } else if (data.ok) {
        toast({ tone: "info", title: `Marked ${data.status}`, description: "Razorpay has no captured payment for this order." });
      } else {
        toast({
          tone: "warning",
          title: "Still unresolved",
          description: data.reason || "Razorpay has not confirmed this payment yet.",
        });
      }
      router.refresh();
    } catch {
      toast({ tone: "error", title: "Network error", description: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={run} disabled={loading} className="btn btn-ghost btn-sm whitespace-nowrap">
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Checking…
        </>
      ) : (
        <>
          <RefreshCw size={13} aria-hidden="true" /> Reconcile
        </>
      )}
    </button>
  );
}
