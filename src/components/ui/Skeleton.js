/** Neutral placeholder blocks used by the route-level loading states. */
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.07] ${className}`} aria-hidden="true" />;
}

export function TextBlock({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-3 animate-pulse rounded bg-white/[0.07] ${index === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
