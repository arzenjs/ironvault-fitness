import Reveal from "@/components/ui/Reveal";

/**
 * Shared layout for the policy pages: sticky table of contents on the left,
 * readable prose column on the right (max ~72ch, which is comfortable at every
 * breakpoint).
 */
export default function LegalPage({ title, updated, intro, sections, footerNote }) {
  return (
    <div className="pt-28 md:pt-36">
      <div className="shell">
        <Reveal variant="fade" className="flex items-center gap-3">
          <span className="h-px w-8 bg-signal" aria-hidden="true" />
          <span className="eyebrow">Policy</span>
        </Reveal>
        <Reveal variant="up" delay={0.05}>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2.2rem,5.4vw,4rem)]">{title}</h1>
        </Reveal>
        <Reveal variant="up" delay={0.12}>
          <p className="lede mt-5 max-w-2xl">{intro}</p>
        </Reveal>
        <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">Last updated: {updated}</p>

        <div className="mt-12 grid gap-10 pb-20 lg:grid-cols-[260px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="eyebrow">On this page</h2>
            <nav aria-label="Sections" className="mt-4">
              <ol className="space-y-2 border-l border-white/10 pl-4">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block py-0.5 text-[0.8125rem] text-ash transition hover:text-fog"
                    >
                      <span className="mr-2 font-mono text-[0.5625rem] text-ash/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="max-w-[72ch]">
            {sections.map((section, index) => (
              <Reveal key={section.id} as="section" variant="up" amount={0.05} className="scroll-mt-24 border-b border-white/10 pb-8 pt-2 first:pt-0 [&:not(:first-child)]:mt-8">
                <h2 id={section.id} className="scroll-mt-24 text-lg font-semibold text-fog">
                  <span className="mr-3 font-mono text-[0.625rem] text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ash">{section.body}</div>
              </Reveal>
            ))}

            {footerNote ? (
              <p className="mt-10 rounded-xl border border-white/10 bg-coal px-4 py-3 text-xs leading-relaxed text-ash">
                {footerNote}
              </p>
            ) : null}
          </article>
        </div>
      </div>
    </div>
  );
}
