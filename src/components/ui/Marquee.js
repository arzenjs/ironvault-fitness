/**
 * CSS-driven marquee. The track is duplicated once and translated by -50%,
 * which keeps the loop seamless with a single transform animation (no JS).
 */
export default function Marquee({ items, duration = 38, className = "", separator = "✦" }) {
  const row = (keyPrefix) => (
    <div className="flex shrink-0 items-center" aria-hidden={keyPrefix === "b" ? "true" : undefined}>
      {items.map((item, index) => (
        <span key={`${keyPrefix}-${index}`} className="flex items-center whitespace-nowrap">
          <span className="display font-display text-[clamp(1.6rem,3.6vw,3rem)] leading-none text-fog/90">
            {item}
          </span>
          <span className="mx-6 text-signal md:mx-9" aria-hidden="true">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee relative overflow-hidden border-y border-white/10 py-5 ${className}`}>
      <div className="marquee-track" style={{ "--marquee-duration": `${duration}s` }}>
        {row("a")}
        {row("b")}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent md:w-32"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent md:w-32"
        aria-hidden="true"
      />
    </div>
  );
}
