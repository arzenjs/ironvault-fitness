"use client";

import { useState } from "react";
import Image from "next/image";
import { VaultMark } from "@/components/ui/Logo";

// Detects whether the caller already chose an object-fit / object-position class.
const HAS_OBJECT_FIT = /(^|\s)(?:[\w-]+:)*object-(?:cover|contain|fill|none|scale-down)(\s|$)/;
const HAS_OBJECT_POSITION = /(^|\s)(?:[\w-]+:)*object-(?!cover|contain|fill|none|scale-down)\S+/;

/**
 * next/image wrapper with a branded fallback.
 *
 * If a file is missing or fails to decode, we render a themed panel with the
 * vault mark instead of a broken image icon. The wrapper also paints a subtle
 * gradient underneath, so the layout never flashes white while loading.
 *
 * Aspect ratio: a `fill` image is stretched to the box by the browser unless it
 * has an object-fit. Callers that do not pass an `object-*` class (for example
 * RevealImage) therefore get `object-cover object-center`, which crops instead of
 * distorting. Pass `object-contain` (or any `object-*` class) in `imgClassName`
 * when the whole image must stay visible, and `object-[x_y]` to move the crop.
 */
export default function SmartImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = "100vw",
  priority = false,
  className = "",
  imgClassName = "",
  quality = 82,
  style,
  loading,
}) {
  const [failed, setFailed] = useState(false);

  const fitClasses = [
    HAS_OBJECT_FIT.test(imgClassName) ? "" : "object-cover",
    HAS_OBJECT_POSITION.test(imgClassName) ? "" : "object-center",
    imgClassName,
  ]
    .filter(Boolean)
    .join(" ");

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden bg-gradient-to-br from-graphite via-steel to-ink ${className}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <VaultMark size={34} className="text-white/30" title="IronVault" />
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-white/35">
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-graphite ${className}`} style={style}>
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes}
        priority={priority}
        loading={loading}
        quality={quality}
        onError={() => setFailed(true)}
        className={fitClasses}
      />
    </div>
  );
}
