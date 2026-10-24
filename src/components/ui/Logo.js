import Link from "next/link";

/**
 * IronVault mark: an octagonal "vault plate" holding an I + V monogram.
 * Pure SVG/typography so it stays crisp in the header, footer, mobile menu
 * and at favicon sizes.
 */
export function VaultMark({ className = "", size = 34, title = "IronVault Fitness" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
    >
      <path
        d="M4.5 12.3 L12.3 4.5 H27.7 L35.5 12.3 V27.7 L27.7 35.5 H12.3 L4.5 27.7 Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="miter"
      />
      <path d="M14 13.5 V26.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="square" />
      <path
        d="M19.5 13.5 L24 26.5 L28.5 13.5"
        stroke="var(--color-signal, #e5231b)"
        strokeWidth="3.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Wordmark + mark lock-up used in the header and footer.
 * `compact` drops the small tagline used on wide screens.
 */
export function Logo({ href = "/", className = "", size = 34, showTagline = false, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="IronVault Fitness — home"
    >
      <VaultMark size={size} className="text-fog transition-transform duration-500 group-hover:rotate-[6deg]" />
      <span className="flex flex-col leading-none">
        <span className="display font-display text-[1.35rem] leading-none tracking-[0.01em] text-fog">
          Iron<span className="text-signal">Vault</span>
        </span>
        {showTagline ? (
          <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-ash">Fitness · Patna</span>
        ) : null}
      </span>
    </Link>
  );
}
