import { Anton, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Font loading through next/font: files are self-hosted by Next at build time,
 * `display: swap` avoids invisible text, and the generated fallback metrics
 * keep layout shift close to zero.
 */
export const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
  fallback: ["Arial Narrow", "Impact", "sans-serif"],
});

export const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-jb",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export const fontVariables = `${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`;
