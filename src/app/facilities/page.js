import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import RevealImage from "@/components/ui/RevealImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { facilities } from "@/config/facilities";
import { media } from "@/config/media";

export const metadata = {
  title: "Facilities & equipment",
  description:
    "Strength and free weights, resistance machines, cardio and conditioning, functional turf and changing facilities at IronVault Fitness — fictional demo listings.",
  alternates: { canonical: "/facilities" },
};

const etiquette = [
  "Re-rack every plate and dumbbell when you finish a set.",
  "Wipe benches and machines after use — towels are at each station.",
  "Do not use platforms for floor work; the turf lane is for that.",
  "Share racks between sets if someone is waiting.",
  "Chalk stays in the chalk bowls, not on the benches.",
  "Report damaged bars or cables to a coach immediately.",
];

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Facilities"
        title={
          <>
            Five zones.
            <br />
            <span className="text-signal">One standard.</span>
          </>
        }
        lede="These are the demo facility listings for this fictional gym. Every zone below is described as an illustrative example — not a verified real-world inventory."
        meta={["1,800 sq ft", "17 hrs weekday access", "Open gym Sundays"]}
        image={media.facilities.strength}
      >
        <Link href="/memberships" className="btn btn-primary">
          Get access <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </PageHero>

      <section className="section pt-0">
        <div className="shell space-y-16 md:space-y-24">
          {facilities.map((facility, index) => (
            <div
              key={facility.id}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${index % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.625rem] tracking-[0.22em] text-signal">{facility.number}</span>
                  <span className="h-px w-10 bg-white/15" aria-hidden="true" />
                  <span className="eyebrow">Zone</span>
                </div>
                <Reveal variant="up">
                  <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3.1rem)]">{facility.title}</h2>
                </Reveal>
                <Reveal variant="up" delay={0.08}>
                  <p className="lede mt-4 max-w-lg">{facility.summary}</p>
                </Reveal>

                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {facility.details.map((detail, detailIndex) => (
                    <Reveal
                      as="li"
                      key={detail}
                      variant="up"
                      delay={0.1 + detailIndex * 0.05}
                      className="flex items-start gap-2 text-sm text-fog/85"
                    >
                      <Check size={14} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                      <span className="leading-snug">{detail}</span>
                    </Reveal>
                  ))}
                </ul>
              </div>

              <RevealImage
                src={facility.image.src}
                alt={facility.image.alt}
                sizes="(max-width: 1024px) 92vw, 560px"
                className="aspect-[4/3] w-full"
                rounded="rounded-[1.4rem]"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="section border-t border-white/10 bg-coal">
        <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Floor policy"
              title="Six rules that keep"
              accent="the floor good"
              size="md"
              lede="Printed at the entrance and enforced by everyone, staff included."
            />
            <p className="mt-5 text-xs leading-relaxed text-ash/70">
              Demo content. Facility descriptions, equipment counts and policies are illustrative for this
              portfolio project.
            </p>
          </div>
          <ol className="divide-y divide-white/10 border-y border-white/10">
            {etiquette.map((rule, index) => (
              <Reveal as="li" key={rule} variant="right" delay={index * 0.04} className="flex gap-4 py-4">
                <span className="font-mono text-[0.625rem] text-ash">0{index + 1}</span>
                <span className="text-sm leading-relaxed text-fog/85">{rule}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink py-16">
        <div className="shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="display text-[clamp(1.7rem,3.6vw,2.6rem)]">Ready to train on it?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/memberships" className="btn btn-primary">
              View memberships <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/gallery" className="btn btn-outline">
              See the gallery
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
