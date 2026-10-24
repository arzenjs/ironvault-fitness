import "@/styles/globals.css";
import { fontVariables } from "@/lib/fonts";
import { getSessionSafe } from "@/lib/session";
import Providers from "@/components/layout/Providers";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { gym, siteUrl } from "@/config/gym";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${gym.name} — ${gym.tagline}`,
    template: `%s · ${gym.name}`,
  },
  description: gym.description,
  applicationName: gym.name,
  keywords: [
    "gym in Patna",
    "premium gym Patna",
    "strength training Bihar",
    "IronVault Fitness",
    "fitness membership Patna",
  ],
  authors: [{ name: gym.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: gym.name,
    title: `${gym.name} — ${gym.tagline}`,
    description: gym.description,
    images: [{ url: "/images/site/og-cover.jpg", width: 1200, height: 630, alt: `${gym.name} training floor` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${gym.name} — ${gym.tagline}`,
    description: gym.description,
    images: ["/images/site/og-cover.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export const viewport = {
  themeColor: "#070709",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }) {
  const session = await getSessionSafe();

  return (
    <html lang="en-IN" className={fontVariables}>
      <head>
        {/* Safety net: if JavaScript never runs, scroll-reveal elements must not
            stay invisible. They are marked with data-reveal. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important;}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-ink font-sans text-fog antialiased">
        <Providers session={session}>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
