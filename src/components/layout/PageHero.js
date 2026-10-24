import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";

/**
 * Shared inner-page hero: editorial heading on the left, optional photo on the
 * right. Keeps every subpage consistent without repeating layout code.
 */
export default function PageHero({ eyebrow, title, lede, image, children, meta }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-28 md:pb-20 md:pt-36">
      <div className="grid-lines absolute inset-0 -z-10 opacity-40" aria-hidden="true" />
      <div className="radial-fade absolute inset-x-0 top-0 -z-10 h-[60vh]" aria-hidden="true" />
      <div className="grain absolute inset-0 -z-10" aria-hidden="true" />

      <div className="shell">
        <div className={`grid gap-10 ${image ? "lg:grid-cols-[1.15fr_0.85fr] lg:items-end" : ""}`}>
          <div>
            {eyebrow ? (
              <Reveal variant="fade" className="flex items-center gap-3">
                <span className="h-px w-8 bg-signal" aria-hidden="true" />
                <span className="eyebrow">{eyebrow}</span>
              </Reveal>
            ) : null}

            <Reveal variant="up" delay={0.06}>
              <h1 className="display-tight mt-6 text-[clamp(2.6rem,7vw,5.6rem)]">{title}</h1>
            </Reveal>

            {lede ? (
              <Reveal variant="up" delay={0.14}>
                <p className="lede mt-6 max-w-xl">{lede}</p>
              </Reveal>
            ) : null}

            {meta ? (
              <Reveal variant="fade" delay={0.2} className="mt-6 flex flex-wrap gap-2">
                {meta.map((item) => (
                  <span key={item} className="badge">
                    {item}
                  </span>
                ))}
              </Reveal>
            ) : null}

            {children ? (
              <Reveal variant="up" delay={0.22} className="mt-8">
                {children}
              </Reveal>
            ) : null}
          </div>

          {image ? (
            <Reveal variant="scale" delay={0.12} className="relative">
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10">
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(max-width: 1024px) 92vw, 480px"
                  className="aspect-[4/3] w-full"
                  imgClassName="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 -left-3 hidden h-16 w-16 border-b border-l border-signal/60 md:block" aria-hidden="true" />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
