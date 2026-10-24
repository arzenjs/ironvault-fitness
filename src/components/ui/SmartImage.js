"use client";

import { useState } from "react";
import Image from "next/image";
import { VaultMark } from "@/components/ui/Logo";

/**
 * next/image wrapper with a branded fallback.
 *
 * If a file is missing or fails to decode, we render a themed panel with the
 * vault mark instead of a broken image icon. The wrapper also paints a subtle
 * gradient underneath, so the layout never flashes white while loading.
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
        className={imgClassName}
      />
    </div>
  );
}
