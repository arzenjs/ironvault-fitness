import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { footerNav } from "@/config/navigation";
import { gym, gymDirectionsUrl, whatsappUrl } from "@/config/gym";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-coal">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="shell relative py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo size={38} showTagline />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ash">{gym.tagline}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash">
              A strength-first training floor on Fraser Road, Patna.
            </p>

            <address className="mt-7 space-y-3 text-sm not-italic text-ash">
              <a
                href={gymDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-fog"
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                <span>
                  {gym.address.line1}, {gym.address.line2}
                </span>
              </a>
              <a href={gym.phoneHref} className="flex items-center gap-2.5 hover:text-fog">
                <Phone size={15} className="shrink-0 text-signal" aria-hidden="true" />
                {gym.phone}
              </a>
              <a href={`mailto:${gym.email}`} className="flex items-center gap-2.5 break-all hover:text-fog">
                <Mail size={15} className="shrink-0 text-signal" aria-hidden="true" />
                {gym.email}
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-fog"
              >
                <ArrowUpRight size={15} className="shrink-0 text-signal" aria-hidden="true" />
                WhatsApp the front desk
              </a>
            </address>
          </div>

          <nav aria-label="Training links">
            <h2 className="eyebrow">Train</h2>
            <ul className="mt-5 space-y-3 text-sm text-ash">
              {footerNav.train.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline hover:text-fog">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Gym links">
            <h2 className="eyebrow">The gym</h2>
            <ul className="mt-5 space-y-3 text-sm text-ash">
              {footerNav.gym.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline hover:text-fog">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="link-underline hover:text-fog">
                  Member log in
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow">Hours</h2>
            <ul className="mt-5 space-y-4 text-sm text-ash">
              {gym.hours.map((entry) => (
                <li key={entry.days}>
                  <span className="flex items-center gap-2 text-fog">
                    <Clock size={14} className="text-signal" aria-hidden="true" />
                    {entry.days}
                  </span>
                  <span className="mt-1 block font-mono text-xs tracking-wide">
                    {entry.opens} – {entry.closes}
                  </span>
                  <span className="text-xs text-ash/70">{entry.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-7 text-xs text-ash md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {gym.name}. Portfolio demo — fictional business, sample data.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footerNav.legal.map((item) => (
              <Link key={item.href} href={item.href} className="link-underline hover:text-fog">
                {item.label}
              </Link>
            ))}
            <Link href="/faq" className="link-underline hover:text-fog">
              Support
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-[0.6875rem] leading-relaxed text-ash/60">
          Demo notice: IronVault Fitness is a fictional gym created for a portfolio project. Prices,
          facilities, coach profiles, statistics and testimonials are illustrative sample content and do not
          describe a real business. Payments run in Razorpay test mode only.
        </p>
      </div>
    </footer>
  );
}
