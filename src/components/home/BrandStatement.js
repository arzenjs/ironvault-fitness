import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { gym } from "@/config/gym";

/**
 * Editorial brand statement: oversized type on the left, measured copy on the
 * right, with two phrases highlighted as they enter the viewport.
 */
export default function BrandStatement() {
  return (
    <section id="brand-statement" className="relative section border-t border-white/10 bg-coal">
      <div className="shell grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <Reveal variant="fade" className="flex items-center gap-3">
            <span className="h-px w-8 bg-signal" aria-hidden="true" />
            <span className="eyebrow">The IronVault idea</span>
          </Reveal>

          <Reveal variant="up" delay={0.06}>
            <h2 className="display mt-5 text-[clamp(2.1rem,4.7vw,4rem)]">
              Most gyms sell you a door.
              <br />
              <span className="text-ash/60">We build the</span>{" "}
              <span className="relative inline-block">
                <span className="relative z-10">reason</span>
                <Reveal
                  variant="fade"
                  delay={0.5}
                  className="absolute inset-x-0 bottom-1 z-0 h-[0.18em] bg-signal/70"
                  aria-hidden="true"
                />
              </span>{" "}
              to come back.
            </h2>
          </Reveal>
        </div>

        <div className="flex flex-col justify-end gap-6">
          <Reveal variant="up" delay={0.15}>
            <p className="lede">
              IronVault opened on Fraser Road with one conviction: people stay consistent when the room is
              organised, the equipment is honest and someone knows their program. So we invested in platforms
              and coaching before mirrors and marketing.
            </p>
          </Reveal>
          <Reveal variant="up" delay={0.22}>
            <p className="body-muted text-sm">
              Today the floor runs on {gym.established === 2019 ? "six years" : "years"} of member feedback —
              quieter mornings, a written induction for every new member, and a coaching team that tracks your
              block instead of your attendance sheet.
            </p>
          </Reveal>
          <Reveal variant="up" delay={0.3}>
            <Link href="/about" className="group inline-flex items-center gap-2 text-sm font-medium text-fog">
              <span className="link-underline">Read the full story</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
