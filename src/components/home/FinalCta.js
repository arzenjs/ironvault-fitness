import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import { media } from "@/config/media";
import { gym } from "@/config/gym";

/** Full-bleed closing CTA. The photo is decorative; the message carries the weight. */
export default function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-white/10" aria-labelledby="final-cta-heading">
      <div className="absolute inset-0 -z-10">
        <SmartImage
          src={media.training.cta.src}
          alt=""
          sizes="100vw"
          className="h-full w-full"
          imgClassName="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" aria-hidden="true" />
        <div className="grain absolute inset-0" aria-hidden="true" />
      </div>

      <div className="shell relative py-20 md:py-28">
        <Reveal variant="fade">
          <span className="eyebrow">Last call</span>
        </Reveal>
        <Reveal variant="up" delay={0.06}>
          <h2 id="final-cta-heading" className="display-tight mt-4 max-w-3xl text-[clamp(2.6rem,8vw,6rem)]">
            Your first block
            <br />
            <span className="text-signal">starts here.</span>
          </h2>
        </Reveal>
        <Reveal variant="up" delay={0.14}>
          <p className="lede mt-6 max-w-xl">
            Choose a plan, pay securely through Razorpay, and your membership is active as soon as the payment
            is verified. One-time payment, no auto-debit.
          </p>
        </Reveal>
        <Reveal variant="up" delay={0.2} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/memberships" className="btn btn-primary group">
            View memberships
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <a href={gym.phoneHref} className="btn btn-outline">
            <Phone size={15} aria-hidden="true" /> {gym.phone}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
