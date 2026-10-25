import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { roleHome } from "@/lib/redirects";

/**
 * Rendered when a signed-in user reaches a page their role cannot use.
 * The server still refuses the underlying data — this is only the friendly face.
 */
export default function AccessDenied({ required = "staff", area = "this area", role, reason }) {
  const home = roleHome(role);
  const disabled = reason === "disabled";

  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <div className="shell">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
          <ShieldAlert size={22} className="text-signal" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-6">Access denied</p>
        <h1 className="display mt-3 text-[clamp(2rem,5vw,3.4rem)]">
          {disabled ? "Account disabled" : "Not your part of the gym"}
        </h1>
        <p className="lede mt-4 max-w-lg">
          {disabled
            ? "This account has been disabled, so it cannot open protected areas. Contact an administrator if you think this is a mistake."
            : `${area} requires a ${required} account. Your session is valid, but this role does not have permission — authorisation is enforced on the server for every page and API request.`}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {disabled ? null : (
            <Link href={home.href} className="btn btn-primary">
              {role === "staff" ? "Go to the staff portal" : "Go to my account"}
            </Link>
          )}
          <Link href="/" className="btn btn-outline">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
