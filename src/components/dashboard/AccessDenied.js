import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * Rendered when a signed-in user reaches a page their role cannot use.
 * The server still refuses the underlying data — this is only the friendly face.
 */
export default function AccessDenied({ required = "staff", area = "this area" }) {
  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <div className="shell">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
          <ShieldAlert size={22} className="text-signal" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-6">Access denied</p>
        <h1 className="display mt-3 text-[clamp(2rem,5vw,3.4rem)]">Not your part of the gym</h1>
        <p className="lede mt-4 max-w-lg">
          {area} requires a {required} account. Your session is valid, but this role does not have permission —
          authorisation is enforced on the server for every page and API request.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/account" className="btn btn-primary">
            Go to my account
          </Link>
          <Link href="/" className="btn btn-outline">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
