import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import RevealImage from "@/components/ui/RevealImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { trainingPrinciples } from "@/config/trainers";
import { media } from "@/config/media";

/**
 * Coaching approach: layered images on the left, numbered principles stacked on
 * the right. Each principle slides in from the right with its own delay, so the
 * eye is pulled down the list rather than the whole block appearing at once.
 */
export default function Philosophy() {
  return (
    <section className="relative section overflow-hidden border-t border-white/10 bg-coal" aria-labelledby="philosophy-heading">
      <div className="shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        {/* layered imagery */}
        <div className="relative order-2 lg:order-1">
          {/* Only the two photographs are layered; the coaching note sits below this block in
              normal flow, so the overlapping thumbnail can never cover the text. */}
          <div className="relative pb-10">
            <div className="relative z-10 w-[82%]">
              <RevealImage
                src={media.about.group.src}
                alt={media.about.group.alt}
                sizes="(max-width: 1024px) 80vw, 400px"
                className="aspect-[4/5] w-full"
                rounded="rounded-[1.4rem]"
              />
            </div>
            <div className="absolute bottom-0 right-0 z-20 w-[52%] overflow-hidden rounded-[1.2rem] border border-white/15 shadow-2xl">
              <RevealImage
                src={media.about.class.src}
                alt={media.about.class.alt}
                sizes="(max-width: 1024px) 50vw, 260px"
                className="aspect-square w-full"
                rounded="rounded-[1.2rem]"
                delay={0.15}
              />
            </div>
          </div>
          <div className="absolute -left-3 top-6 hidden h-24 w-px bg-gradient-to-b from-signal to-transparent md:block" aria-hidden="true" />

          <Reveal variant="up" delay={0.3} className="relative z-30 mt-6 max-w-[15rem] lg:mt-8">
            <p className="text-sm leading-relaxed text-ash">
              <span className="text-fog">“Technique volume before load.”</span> The line every new member hears
              in their first week — and the reason the floor stays injury-free.
            </p>
          </Reveal>
        </div>

        {/* principles */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Coaching approach"
            title="Three rules we do not"
            accent="negotiate"
            size="md"
            lede="Our programming is boring on purpose: assess, build, progress. It is also why members stay past the three-month mark."
          />

          <ol className="mt-10 space-y-8">
            {trainingPrinciples.map((principle, index) => (
              <Reveal as="li" key={principle.step} variant="right" delay={index * 0.08} className="group flex gap-5">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[0.6875rem] text-ash transition-colors group-hover:border-signal group-hover:text-signal">
                  {principle.step}
                </span>
                <div className="border-b border-white/10 pb-7">
                  <h3 className="text-lg font-semibold text-fog">{principle.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-ash">{principle.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal variant="up" delay={0.25} className="mt-8">
            <Link href="/trainers" className="group inline-flex items-center gap-2 text-sm font-medium text-fog">
              <span className="link-underline">Meet the coaching team</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
