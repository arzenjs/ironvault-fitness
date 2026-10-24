export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-24" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 rounded-full border border-white/15" aria-hidden="true" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-signal" aria-hidden="true" />
        </div>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.28em] text-ash">Loading</p>
      </div>
    </div>
  );
}
