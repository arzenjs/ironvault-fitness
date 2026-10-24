import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { VaultMark } from "@/components/ui/Logo";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden pt-24">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="radial-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="shell relative py-20">
        <VaultMark size={44} className="text-fog/70" />
        <p className="eyebrow mt-8">Error 404</p>
        <h1 className="display mt-4 text-[clamp(3rem,10vw,7.5rem)]">
          Off the <span className="text-signal">floor</span>
        </h1>
        <p className="lede mt-6 max-w-lg">
          That page is not part of this demo. The racks, plans and your account are all still where you left
          them.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-light">
            <ArrowLeft size={16} aria-hidden="true" /> Back to home
          </Link>
          <Link href="/memberships" className="btn btn-outline">
            <Compass size={16} aria-hidden="true" /> View memberships
          </Link>
        </div>
      </div>
    </section>
  );
}
