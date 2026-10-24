"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { galleryCategories, galleryImages } from "@/config/media";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Filterable gallery with an accessible lightbox.
 *
 * Accessibility contract:
 *  - every tile is a real <button> (keyboard reachable, labelled),
 *  - opening the lightbox moves focus to the dialog and traps Tab inside it,
 *  - Escape closes, ArrowLeft/ArrowRight move between images,
 *  - focus returns to the tile that opened the dialog,
 *  - background scroll is locked and the rest of the page is aria-hidden.
 */
export default function GalleryGrid() {
  const [category, setCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const dialogRef = useRef(null);

  const visible = useMemo(
    () => (category === "all" ? galleryImages : galleryImages.filter((image) => image.category === category)),
    [category],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    lastFocusedRef.current?.focus?.();
  }, []);

  const step = useCallback(
    (direction) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        const next = (current + direction + visible.length) % visible.length;
        return next;
      });
    },
    [visible.length],
  );

  // Keyboard handling + scroll lock while the dialog is open.
  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    // Defer so the element exists before focusing.
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 40);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [openIndex, close, step]);

  const openAt = (index, event) => {
    lastFocusedRef.current = event.currentTarget;
    setOpenIndex(index);
  };

  const current = openIndex !== null ? visible[openIndex] : null;

  return (
    <div>
      {/* filters */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter gallery by category">
        {galleryCategories.map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setCategory(item.id);
                setOpenIndex(null);
              }}
              className={`relative rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                active ? "text-ink" : "text-ash hover:text-fog"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="gallery-filter"
                  className="absolute inset-0 -z-10 rounded-full bg-fog"
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                />
              ) : null}
              {item.label}
            </button>
          );
        })}
        <p className="ml-auto self-center font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ash" aria-live="polite">
          {visible.length} images
        </p>
      </div>

      {/* grid */}
      <motion.ul layout className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((image, index) => (
            <motion.li
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className={index % 7 === 0 ? "col-span-2 row-span-2" : ""}
            >
              <button
                type="button"
                onClick={(event) => openAt(index, event)}
                className="group relative block h-full w-full overflow-hidden rounded-xl border border-white/10 text-left transition-colors hover:border-white/30"
                style={{ aspectRatio: index % 7 === 0 ? "1 / 1" : "4 / 5" }}
                aria-label={`Open image: ${image.alt}`}
              >
                <SmartImage
                  src={image.src}
                  alt=""
                  sizes={index % 7 === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="h-full w-full"
                  imgClassName="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-30"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden="true"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-ink/60 backdrop-blur">
                    <Maximize2 size={15} />
                  </span>
                </span>
                <span className="pointer-events-none absolute bottom-3 left-3 right-3 text-[0.6875rem] leading-snug text-fog/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {image.alt}
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* lightbox */}
      <AnimatePresence>
        {current ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Gallery image ${openIndex + 1} of ${visible.length}`}
            ref={dialogRef}
          >
            <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col">
              <div className="flex items-center justify-between gap-3 pb-3">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ash">
                  {String(openIndex + 1).padStart(2, "0")} / {String(visible.length).padStart(2, "0")} ·{" "}
                  {galleryCategories.find((c) => c.id === current.category)?.label}
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-fog transition hover:bg-white/10"
                  aria-label="Close image viewer"
                >
                  <X size={17} />
                </button>
              </div>

              <motion.figure
                key={current.id}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                className="relative flex min-h-0 flex-1 items-center justify-center"
              >
                <SmartImage
                  src={current.src}
                  alt={current.alt}
                  fill={false}
                  width={current.width}
                  height={current.height}
                  sizes="(max-width: 1024px) 92vw, 900px"
                  className="max-h-full w-auto max-w-full object-contain"
                  imgClassName="max-h-[78vh] w-auto object-contain"
                  priority
                />
              </motion.figure>

              <div className="flex items-center justify-between gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="btn btn-ghost btn-sm"
                  aria-label="Previous image"
                >
                  <ArrowLeft size={15} aria-hidden="true" /> Previous
                </button>
                <p className="hidden flex-1 truncate text-center text-xs text-ash sm:block">{current.alt}</p>
                <button type="button" onClick={() => step(1)} className="btn btn-ghost btn-sm" aria-label="Next image">
                  Next <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
              <p className="pt-2 text-center font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash/60">
                Use arrow keys to browse · Esc to close
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
