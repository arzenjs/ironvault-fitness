import Link from "next/link";
import { ArrowUpRight, Keyboard } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { media } from "@/config/media";

export const metadata = {
  title: "Gallery",
  description:
    "Photographs of strength training, conditioning, coaching and the IronVault floor. All images are locally hosted and optimised.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={
          <>
            The floor,
            <br />
            <span className="text-signal">unedited.</span>
          </>
        }
        lede="Training photographs from the floor. Filter by category, then open any image for a larger view."
        meta={["14 photographs", "Filterable", "Keyboard accessible"]}
        image={media.training.cta}
      />

      <section className="pb-20">
        <div className="shell">
          <GalleryGrid />

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-white/10 bg-coal px-4 py-3 sm:flex-row sm:items-center">
            <p className="inline-flex items-center gap-2 text-xs text-ash">
              <Keyboard size={14} className="text-signal" aria-hidden="true" />
              Keyboard: Tab to a photo, Enter to open, arrows to browse, Esc to close.
            </p>
            <Link
              href="/memberships"
              className="inline-flex items-center gap-1 text-xs font-medium text-fog hover:text-signal"
            >
              Train here <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
