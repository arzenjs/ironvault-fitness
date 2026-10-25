import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { trainers } from "@/config/trainers";

/** Coach cards: portrait, focus tags and a hover lift. */
export default function TrainersPreview() {
  return (
    <section className="section border-t border-white/10 bg-ink" aria-labelledby="coaches-heading">
      <div className="shell">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The coaching team"
            title="People who read"
            accent="your program"
            lede="Meet the person responsible for your first six weeks: four coaches who own your assessment, your programming and your progress."
            size="md"
          />
          <Link href="/trainers" className="btn btn-outline shrink-0 self-start md:self-auto">
            All coaches
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((trainer, index) => (
            <Reveal key={trainer.id} variant="up" delay={index * 0.07}>
              <article className="group relative h-full overflow-hidden rounded-[1.3rem] border border-white/10 bg-coal transition-colors duration-300 hover:border-white/25">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SmartImage
                    src={trainer.image.src}
                    alt={trainer.image.alt}
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
                    className="h-full w-full"
                    imgClassName="object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" aria-hidden="true" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-ink/60 px-2 py-1 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-fog/80 backdrop-blur">
                    {trainer.focus[0]}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-signal">
                      {trainer.years} yrs · {trainer.availability}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold leading-tight text-fog">{trainer.name}</h3>
                    <p className="text-xs text-ash">{trainer.role}</p>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="flex flex-wrap gap-1.5">
                    {trainer.focus.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/12 px-2 py-1 text-[0.625rem] text-ash"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
