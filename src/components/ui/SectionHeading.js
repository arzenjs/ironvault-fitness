import Reveal from "@/components/ui/Reveal";

/**
 * Consistent section header: eyebrow → oversized display heading → optional lede.
 * `align="left"` for editorial layouts, `center` for symmetrical sections.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  size = "lg",
  className = "",
  accent,
  children,
}) {
  const sizes = {
    sm: "text-[clamp(1.9rem,3.6vw,2.8rem)]",
    md: "text-[clamp(2.2rem,4.6vw,3.6rem)]",
    lg: "text-[clamp(2.6rem,6vw,4.75rem)]",
    xl: "text-[clamp(3rem,8vw,7rem)]",
  };

  return (
    <div
      className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      {eyebrow ? (
        <Reveal variant="fade" className="mb-4 flex items-center gap-3">
          {align === "left" ? <span className="h-px w-8 bg-signal" aria-hidden="true" /> : null}
          <span className="eyebrow">{eyebrow}</span>
          {align === "center" ? <span className="h-px w-8 bg-signal" aria-hidden="true" /> : null}
        </Reveal>
      ) : null}

      <Reveal variant="up" delay={0.05}>
        <h2 className={`display ${sizes[size]}`}>
          {title}
          {accent ? (
            <>
              {" "}
              <span className="text-signal">{accent}</span>
            </>
          ) : null}
        </h2>
      </Reveal>

      {lede ? (
        <Reveal variant="up" delay={0.14}>
          <p className={`lede mt-5 ${align === "center" ? "mx-auto" : ""}`}>{lede}</p>
        </Reveal>
      ) : null}

      {children}
    </div>
  );
}
