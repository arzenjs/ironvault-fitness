import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import SectionHeading from "@/components/ui/SectionHeading";
import { galleryImages } from "@/config/media";

/**
 * Asymmetric gallery strip. Images zoom slowly on hover; the whole tile is a
 * link to the full gallery (where the lightbox lives), so nothing here traps
 * keyboard focus in a modal.
 */
const picks = ["g04", "g02", "g07", "g09", "g13", "g03"];

export default function GalleryPreview() {
  const images = picks
    .map((id) => galleryImages.find((image) => image.id === id))
    .filter(Boolean);

  return (
    <section className="section border-t border-white/10 bg-ink" aria-labelledby="gallery-heading">
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Gallery" title="Inside the vault" size="md" />
          <Link href="/gallery" className="btn btn-outline shrink-0 self-start md:self-auto">
            Open gallery
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[170px] md:grid-cols-4 md:gap-4">
          {images.map((image, index) => {
            const spans = [
              "col-span-2 row-span-2",
              "col-span-1 row-span-1",
              "col-span-1 row-span-1",
              "col-span-1 row-span-2",
              "col-span-1 row-span-1",
              "col-span-2 row-span-1",
            ];
            return (
              <Reveal
                key={image.id}
                variant="scale"
                delay={index * 0.05}
                className={`group relative overflow-hidden rounded-xl border border-white/10 ${spans[index % spans.length]}`}
              >
                <Link href="/gallery" className="block h-full w-full" aria-label={`Open the gallery — ${image.alt}`}>
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="h-full w-full"
                    imgClassName="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-40"
                    aria-hidden="true"
                  />
                  <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-fog opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight size={11} aria-hidden="true" /> View
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
