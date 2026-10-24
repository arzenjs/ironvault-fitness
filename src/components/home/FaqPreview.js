import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import Reveal from "@/components/ui/Reveal";
import { faqPreview } from "@/config/faq";

export default function FaqPreview() {
  return (
    <section className="section border-t border-white/10 bg-ink" aria-labelledby="faq-heading">
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Reveal variant="fade" className="flex items-center gap-3">
            <span className="h-px w-8 bg-signal" aria-hidden="true" />
            <span className="eyebrow">Questions</span>
          </Reveal>
          <Reveal variant="up" delay={0.05}>
            <h2 className="display mt-5 text-[clamp(2rem,4.2vw,3.4rem)]">
              Before your
              <br />
              first session
            </h2>
          </Reveal>
          <Reveal variant="up" delay={0.12}>
            <p className="body-muted mt-5 max-w-sm text-sm">
              The short version. The full list covers payments, receipts, facilities and account handling.
            </p>
          </Reveal>
          <Reveal variant="up" delay={0.18}>
            <Link href="/faq" className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-fog">
              <span className="link-underline">All questions</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <Reveal variant="up" delay={0.1}>
          <Accordion items={faqPreview.map((item) => ({ q: item.q, a: item.a }))} defaultOpen={0} />
        </Reveal>
      </div>
    </section>
  );
}
