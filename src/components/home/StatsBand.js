import Reveal from "@/components/ui/Reveal";
import StatCounter from "@/components/ui/StatCounter";
import { gym } from "@/config/gym";

/** Animated counters. Values are clearly labelled sample figures for the demo. */
export default function StatsBand() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-ink" aria-labelledby="stats-heading">
      <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="shell relative">
        <div className="flex flex-wrap items-end justify-between gap-4 py-8 md:py-10">
          <h2 id="stats-heading" className="eyebrow">
            The floor in numbers
          </h2>
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ash/60">
            Sample demo data — not verified figures
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] lg:grid-cols-4">
          {gym.stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              variant="up"
              delay={index * 0.07}
              className="group relative bg-ink p-5 transition-colors duration-300 hover:bg-coal md:p-7"
            >
              <dd className="display text-[clamp(2.1rem,5.2vw,3.6rem)] leading-none text-fog">
                <StatCounter value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-3 text-sm font-medium text-fog/90">{stat.label}</dt>
              <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">{stat.note}</p>
              <span
                className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-500 group-hover:scale-x-100 md:inset-x-7"
                aria-hidden="true"
              />
            </Reveal>
          ))}
        </dl>
      </div>
      <div className="h-8" />
    </section>
  );
}
