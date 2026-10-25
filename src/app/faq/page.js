import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";
import { faqCategories } from "@/config/faq";
import { whatsappUrl } from "@/config/gym";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about memberships, payments, facilities and account handling at IronVault Fitness.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title={
          <>
            Questions,
            <br />
            <span className="text-signal">answered.</span>
          </>
        }
        lede="Grouped by topic: memberships, payments, the facility and your account."
      />

      <section className="pb-20">
        <div className="shell">
          {/* quick jump */}
          <nav aria-label="FAQ categories" className="flex flex-wrap gap-2">
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border border-white/12 px-4 py-2 text-xs text-ash transition hover:border-white/35 hover:text-fog"
              >
                {category.label}
              </a>
            ))}
          </nav>

          <div className="mt-12 space-y-14">
            {faqCategories.map((category, index) => (
              <div key={category.id} id={category.id} className="scroll-mt-28">
                <Reveal variant="up" className="mb-5 flex items-baseline gap-3">
                  <span className="font-mono text-[0.625rem] tracking-[0.22em] text-signal">
                    0{index + 1}
                  </span>
                  <h2 className="display text-[clamp(1.6rem,3.4vw,2.4rem)]">{category.label}</h2>
                </Reveal>
                <Accordion
                  items={category.items.map((item) => ({ q: item.q, a: item.a }))}
                  defaultOpen={index === 0 ? 0 : null}
                />
              </div>
            ))}
          </div>

          {/* help */}
          <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[1.25rem] border border-white/10 bg-coal p-6 md:flex-row md:items-center md:p-8">
            <div>
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">Still stuck?</h2>
              <p className="mt-2 max-w-md text-sm text-ash">
                Call the front desk or send a WhatsApp message. For payment questions, include your payment
                reference so we can look it up quickly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp
              </a>
              <Link href="/contact" className="btn btn-outline">
                Contact form <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
