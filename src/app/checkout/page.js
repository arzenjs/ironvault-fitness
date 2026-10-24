import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CheckoutClient from "@/components/memberships/CheckoutClient";
import { getSessionUser } from "@/lib/session";
import { getPlanById, membershipPlans } from "@/config/membership-plans";
import { formatINR, formatPlanDuration } from "@/lib/format";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const metadata = {
  title: "Checkout",
  description: "Complete your IronVault membership purchase securely.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const planId = typeof params?.plan === "string" ? params.plan : "";
  const plan = getPlanById(planId);

  // Unknown or missing plan → send the visitor back to the plan list.
  if (!plan) {
    return (
      <section className="flex min-h-[70vh] items-center pt-24">
        <div className="shell">
          <p className="eyebrow">Checkout</p>
          <h1 className="display mt-4 text-[clamp(2rem,5vw,3.5rem)]">Choose a plan first</h1>
          <p className="lede mt-4 max-w-lg">
            That plan link was not recognised. Pick one of the three current memberships to continue.
          </p>
          <Link href="/memberships" className="btn btn-primary mt-7">
            <ArrowLeft size={15} aria-hidden="true" /> View memberships
          </Link>
        </div>
      </section>
    );
  }

  // Authentication is required: preserve the selection through login.
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);
  }

  return (
    <section className="pt-28 md:pt-36">
      <div className="shell pb-20">
        <Link href="/memberships" className="inline-flex items-center gap-1.5 text-xs text-ash transition hover:text-fog">
          <ArrowLeft size={13} aria-hidden="true" /> All plans
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Checkout · step 2 of 2</p>
            <h1 className="display mt-3 text-[clamp(2.1rem,4.6vw,3.4rem)]">
              Confirm your <span className="text-signal">membership</span>
            </h1>
          </div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
            {membershipPlans.length} plans available · {formatPlanDuration(plan.durationMonths)}
          </p>
        </div>

        <div className="mt-10">
          <CheckoutClient plan={plan} user={user} razorpayConfigured={isRazorpayConfigured()} />
        </div>

        <p className="mt-8 text-[0.6875rem] leading-relaxed text-ash/60">
          Price shown: {formatINR(plan.pricePaise)}. The server recalculates this amount from the plan
          configuration before creating the Razorpay order — the browser cannot change it.
        </p>
      </div>
    </section>
  );
}
