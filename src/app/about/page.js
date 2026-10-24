import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import RevealImage from "@/components/ui/RevealImage";
import SectionHeading from "@/components/ui/SectionHeading";
import Marquee from "@/components/ui/Marquee";
import StatsBand from "@/components/home/StatsBand";
import { media } from "@/config/media";
import { gym } from "@/config/gym";

export const metadata = {
  title: "About the gym",
  description:
    "The story, training philosophy and environment behind IronVault Fitness — a fictional strength-first gym in Patna used for this portfolio demo.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "The floor comes first",
    body: "Equipment is maintained weekly, plates are re-racked by everyone including staff, and platforms are never used for stretching. A well-kept room is the cheapest form of coaching.",
  },
  {
    title: "Coaching over supervision",
    body: "A coach on the floor is not a lifeguard. They are there to correct a hinge, adjust your block and tell you when to stop — not to count your reps from a desk.",
  },
  {
    title: "Honest progress",
    body: "We do not sell before-and-after promises. We track your lifts, your measurements and how you feel in week four, then change one variable at a time.",
  },
  {
    title: "Everyone starts somewhere",
    body: "Beginners get the same assessment and written induction as our most experienced members. Nobody is left guessing what to do on day one.",
  },
];

const expectations = [
  "A floor tour before you pay anything",
  "A movement screen and training-history conversation",
  "A written four-week starting block",
  "Coaches who will re-rack with you, not around you",
  "Quiet morning hours for people training before work",
  "A clear exit: no lock-in, no auto-debit, no retention calls",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About IronVault"
        title={
          <>
            A gym built by
            <br />
            <span className="text-signal">people who train.</span>
          </>
        }
        lede="IronVault Fitness is a fictional premium gym created for this portfolio project. The story below is sample content, but every design and product decision around it is real."
        meta={["Est. 2019", "Fraser Road, Patna", "Accessible by design"]}
        image={media.about.barbell}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/memberships" className="btn btn-primary">
            View memberships <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Book a tour
          </Link>
        </div>
      </PageHero>

      {/* story */}
      <section className="section border-t border-white/10 bg-coal">
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative">
            <RevealImage
              src={media.about.stretch.src}
              alt={media.about.stretch.alt}
              sizes="(max-width: 1024px) 92vw, 420px"
              className="aspect-[4/5] w-full"
            />
            <div className="absolute -bottom-5 -right-3 rounded-xl border border-white/15 bg-ink px-4 py-3 md:-right-6">
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-signal">The room</p>
              <p className="mt-1 text-sm text-fog">1,800 sq ft of training floor</p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Started with six racks"
              accent="and a rule"
              size="md"
            />
            <div className="mt-6 space-y-5 text-[0.9375rem] leading-relaxed text-ash">
              <p>
                In 2019 the founders — three lifters who had spent years training in rooms where the bars were
                bent and the music was louder than the coaching — leased a first-floor space on Fraser Road and
                put in six racks before anything else. The changing rooms came second. The reception desk came
                last.
              </p>
              <p>
                That order still describes the gym. Strength equipment is replaced on a schedule, not when it
                breaks. The coaching team writes its own programming instead of importing a franchise template.
                And every new member is walked through the floor before they are sold anything.
              </p>
              <p>
                <span className="text-fog">Everything on this page is fictional sample content</span> for a
                portfolio demonstration. The details are internally consistent, but they do not describe a real
                business, real staff or real members.
              </p>
            </div>

            <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] sm:grid-cols-3">
              {[
                ["Opened", `${gym.established}`],
                ["Floor", "1,800 sq ft"],
                ["Coaches", "9 on rotation"],
                ["Racks", "6 + 4 platforms"],
                ["Hours", "17 / weekday"],
                ["Area", "Fraser Road"],
              ].map(([label, value]) => (
                <div key={label} className="bg-ink px-4 py-4">
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ash">{label}</dt>
                  <dd className="mt-1.5 text-sm font-medium text-fog">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Marquee items={["Assess", "Build", "Progress", "Repeat"]} duration={32} separator="→" />

      {/* values */}
      <section className="section bg-ink">
        <div className="shell">
          <SectionHeading
            eyebrow="What we stand for"
            title="Four values, written"
            accent="on the wall"
            lede="These are the lines that decide how the floor is run when nobody is watching."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] md:grid-cols-2">
            {values.map((value, index) => (
              <Reveal key={value.title} variant="up" delay={index * 0.06} className="group bg-ink p-6 md:p-8">
                <span className="font-mono text-[0.625rem] tracking-[0.2em] text-signal">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-fog">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ash">{value.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      {/* environment */}
      <section className="section bg-coal">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <SectionHeading
              eyebrow="The environment"
              title="Dark, quiet,"
              accent="organised"
              size="md"
              lede="Low-key lighting, rubber flooring that actually absorbs a dropped deadlift, and music at a volume that lets you talk to your coach."
            />

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {expectations.map((item, index) => (
                <Reveal as="li" key={item} variant="up" delay={index * 0.04} className="flex items-start gap-2.5 text-sm text-fog/90">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal/20 text-signal" aria-hidden="true">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className="leading-snug">{item}</span>
                </Reveal>
              ))}
            </ul>

            <Link href="/facilities" className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-fog">
              <span className="link-underline">See the facilities</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="order-1 grid grid-cols-2 gap-3 lg:order-2">
            <RevealImage
              src={media.training.community.src}
              alt={media.training.community.alt}
              sizes="(max-width: 1024px) 45vw, 280px"
              className="col-span-2 aspect-[16/10]"
            />
            <RevealImage
              src={media.about.group.src}
              alt={media.about.group.alt}
              sizes="(max-width: 1024px) 45vw, 280px"
              className="aspect-square"
              delay={0.1}
            />
            <RevealImage
              src={media.about.class.src}
              alt={media.about.class.alt}
              sizes="(max-width: 1024px) 45vw, 280px"
              className="aspect-square"
              delay={0.18}
            />
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="border-t border-white/10 bg-ink py-16 md:py-20">
        <div className="shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="display text-[clamp(1.9rem,4vw,3rem)]">Come see the floor</h2>
            <p className="mt-3 max-w-lg text-sm text-ash">
              Walk in during staffed hours, or send us a message and we will set aside twenty minutes with a
              coach.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-light">
              Plan a visit <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/memberships" className="btn btn-outline">
              Membership plans
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
