import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PlanCard from "@/components/memberships/PlanCard";
import { membershipPlans } from "@/config/membership-plans";

/** Homepage membership block: three plans + a short trust row. */
export default function MembershipSection() {
  return (
    <section id="memberships" className="relative section overflow-hidden border-t border-white/10 bg-coal" aria-labelledby="membership-heading">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
        style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(229,35,27,0.16), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="shell relative">
        <SectionHeading
          eyebrow="Memberships"
          title="Pick the block that fits"
          accent="your season"
          align="center"
          lede="One-time payments, no auto-debit, no joining fee. Buy online in test mode and your plan activates the moment the payment is verified."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3 md:items-stretch">
          {membershipPlans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        <Reveal variant="fade" delay={0.15} className="mt-8 flex flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ash">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-signal" aria-hidden="true" /> Razorpay secure checkout
            </span>
            <span>No recurring billing</span>
            <span>Cancel by simply not renewing</span>
          </div>
          <Link href="/memberships" className="group inline-flex items-center gap-2 text-sm font-medium text-fog">
            <span className="link-underline">Compare plans in detail</span>
            <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
