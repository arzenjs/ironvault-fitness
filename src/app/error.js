"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

/**
 * Route-level error boundary. Never renders the raw error object — visitors see
 * a friendly panel, while the digest (a safe reference id) is shown so support
 * can correlate it with server logs.
 */
export default function GlobalRouteError({ error, reset }) {
  useEffect(() => {
    console.error("[route-error]", error.digest || error.message);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <div className="shell py-16">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.5rem)]">This page hit a snag</h1>
        <p className="lede mt-5 max-w-xl">
          The request could not be completed. Nothing was charged and no membership changes were made. Try
          again, or head back to a page that works.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-ash">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            <RotateCcw size={16} aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="btn btn-outline">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
