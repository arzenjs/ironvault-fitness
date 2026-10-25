import Link from "next/link";
import { ArrowUpRight, Lock, RefreshCcw, ShieldCheck } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import PlanCard from "@/components/memberships/PlanCard";
import PlanComparison from "@/components/memberships/PlanComparison";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { membershipPlans } from "@/config/membership-plans";
import { faqCategories } from "@/config/faq";
import { getSessionUser } from "@/lib/session";

export const metadata = {
  title: "Memberships & pricing",
  description:
    "Vault Monthly ₹1,499, Vault Quarterly ₹3,999 and Vault Annual ₹13,999. One-time membership payments through Razorpay test-mode checkout.",
  alternates: { canonical: "/memberships" },
};

const paymentFaq = faqCategories.find((category) => category.id === "payments")?.items.slice(0, 3) || [];

export default async function MembershipsPage() {
  const user = await getSessionUser();

  return (
    <>
      <PageHero
        eyebrow="Memberships"
        title={
          <>
            Three plans.
            <br />
            <span className="text-signal">No lock-in.</span>
          </>
        }
        lede="Every plan is a one-time purchase with a fixed duration. Buy online in Razorpay test mode, or pay at the front desk — the price is the same."
        meta={["No auto-debit", "No joining fee", "Instant activation after verification"]}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#plans" className="btn btn-primary">
            Compare plans <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          {user ? (
            <Link href="/account" className="btn btn-outline">
              My account
            </Link>
          ) : (
            <Link href="/register" className="btn btn-outline">
              Create an account
            </Link>
          )}
        </div>
      </PageHero>

      <section id="plans" className="section pt-0">
        <div className="shell">
          <div className="grid gap-5 md:grid-cols-3">
            {membershipPlans.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>

          <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-coal p-5 sm:grid-cols-3 md:p-6">
            {[
              {
                icon: ShieldCheck,
                title: "Verified before activation",
                body: "A membership starts only after the payment signature and the provider's own record are verified on our server.",
              },
              {
                icon: Lock,
                title: "Card details never touch us",
                body: "Razorpay's hosted checkout collects payment details. This app stores only references and amounts.",
              },
              {
                icon: RefreshCcw,
                title: "Queued, not shortened",
                body: "Buying a second plan while one is active schedules it after your current expiry — no paid days are lost.",
              },
            ].map((item) => (
              <Reveal key={item.title} variant="up" className="flex gap-3">
                <item.icon size={18} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-fog">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ash">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-white/10 bg-coal">
        <div className="shell">
          <SectionHeading
            eyebrow="Side by side"
            title="What each plan"
            accent="actually includes"
            size="md"
            lede="On phones the table becomes stacked plan cards, so nothing needs horizontal scrolling."
          />
          <div className="mt-10">
            <PlanComparison />
          </div>
        </div>
      </section>

      <section className="section border-t border-white/10 bg-ink">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Payment questions" title="Before you pay" size="sm" />
            <p className="mt-4 text-sm leading-relaxed text-ash">
              Full details are in the{" "}
              <Link href="/faq" className="text-fog underline decoration-signal/60 underline-offset-4">
                FAQ
              </Link>
              . Online payments currently run in Razorpay test mode — no real money moves.
            </p>
          </div>
          <Accordion items={paymentFaq.map((item) => ({ q: item.q, a: item.a }))} defaultOpen={0} />
        </div>
      </section>
    </>
  );
}
