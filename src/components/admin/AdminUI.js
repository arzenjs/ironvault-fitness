import Link from "next/link";

/** Small presentational helpers shared by the admin pages (server-renderable). */

export function AdminPageHeader({ eyebrow = "Admin", title, accent, description, actions }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,4vw,2.8rem)]">
          {title} {accent ? <span className="text-signal">{accent}</span> : null}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, href, tone = "default" }) {
  const body = (
    <>
      <p className="eyebrow">{label}</p>
      <p
        className={`display mt-2 text-[clamp(1.6rem,3vw,2.2rem)] ${
          tone === "warn" ? "text-amber-200" : tone === "bad" ? "text-red-200" : "text-fog"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[0.6875rem] leading-snug text-ash">{hint}</p> : null}
    </>
  );
  const classes = "card block p-5 transition-colors";
  return href ? (
    <Link href={href} className={`${classes} hover:border-white/25`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

export function EmptyState({ children }) {
  return <p className="rounded-xl border border-white/10 bg-coal px-4 py-5 text-xs leading-relaxed text-ash">{children}</p>;
}

export function SectionTitle({ id, children, aside }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 id={id} className="text-sm font-semibold text-fog">
        {children}
      </h2>
      {aside ? <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">{aside}</p> : null}
    </div>
  );
}

/** Plain GET filter tabs: work without JavaScript and keep the filter in the URL. */
export function FilterTabs({ basePath, param, current, options, extra = {} }) {
  const hrefFor = (value) => {
    const search = new URLSearchParams();
    for (const [key, val] of Object.entries(extra)) if (val) search.set(key, val);
    if (value !== "all") search.set(param, value);
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
      {options.map((option) => (
        <li key={option.value} className="shrink-0">
          <Link
            href={hrefFor(option.value)}
            aria-current={current === option.value ? "true" : undefined}
            className={`block whitespace-nowrap rounded-full px-3.5 py-2 text-xs transition ${
              current === option.value ? "bg-white/10 font-medium text-fog" : "text-ash hover:text-fog"
            }`}
          >
            {option.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
