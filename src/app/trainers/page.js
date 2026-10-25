import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { trainers, trainingPrinciples } from "@/config/trainers";
import { media } from "@/config/media";

export const metadata = {
  title: "Coaching team",
  description:
    "Meet the IronVault coaching team and the assessment-first approach behind every training block.",
  alternates: { canonical: "/trainers" },
};

export default function TrainersPage() {
  return (
    <>
      <PageHero
        eyebrow="Coaching"
        title={
          <>
            Coached, not
            <br />
            <span className="text-signal">supervised.</span>
          </>
        }
        lede="Meet the people who own your programming: their specialisations, experience and floor availability, so you can ask for the right coach."
        meta={["4 coaches", "Assessment included", "Book through the front desk"]}
        image={media.about.group}
      >
        <Link href="/contact" className="btn btn-primary">
          Ask about coaching <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </PageHero>

      <section className="section pt-0">
        <div className="shell">
          <div className="grid gap-5 sm:grid-cols-2">
            {trainers.map((trainer, index) => (
              <Reveal key={trainer.id} variant="up" delay={index * 0.07}>
                <article className="group grid h-full gap-5 rounded-[1.3rem] border border-white/10 bg-coal p-4 transition-colors hover:border-white/25 sm:grid-cols-[150px_1fr] md:p-5">
                  <div className="relative overflow-hidden rounded-xl">
                    <SmartImage
                      src={trainer.image.src}
                      alt={trainer.image.alt}
                      sizes="(max-width: 640px) 90vw, 150px"
                      className="aspect-[4/5] w-full sm:h-full"
                      imgClassName="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold leading-tight text-fog">{trainer.name}</h2>
                    <p className="mt-1 text-sm text-signal">{trainer.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ash">{trainer.bio}</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {trainer.focus.map((tag) => (
                        <li key={tag} className="rounded-full border border-white/12 px-2 py-1 text-[0.625rem] text-ash">
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 text-[0.6875rem] text-ash">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} className="text-signal" aria-hidden="true" />
                        {trainer.availability}
                      </span>
                      <span>{trainer.years} years coaching</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      <section className="section border-t border-white/10 bg-coal">
        <div className="shell">
          <SectionHeading
            eyebrow="How coaching works here"
            title="A block, not a"
            accent="workout list"
            align="center"
            lede="Every coaching block follows the same three-step structure: assess, build, progress."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {trainingPrinciples.map((principle, index) => (
              <Reveal key={principle.step} variant="up" delay={index * 0.08} className="card p-6">
                <span className="font-mono text-[0.625rem] tracking-[0.2em] text-signal">{principle.step}</span>
                <h3 className="mt-4 text-lg font-semibold text-fog">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ash">{principle.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink py-16">
        <div className="shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="display text-[clamp(1.7rem,3.6vw,2.6rem)]">Train with a coach</h2>
            <p className="mt-3 max-w-lg text-sm text-ash">
              Every plan includes an orientation. Quarterly and annual memberships add a full fitness assessment.
            </p>
          </div>
          <Link href="/memberships" className="btn btn-primary">
            See what is included <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
