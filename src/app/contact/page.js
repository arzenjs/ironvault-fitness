import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import PageHero from "@/components/layout/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/ui/Reveal";
import { gym, gymDirectionsUrl, gymMapEmbedUrl, whatsappUrl } from "@/config/gym";
import { media } from "@/config/media";

export const metadata = {
  title: "Contact & location",
  description:
    "Visit IronVault Fitness on Fraser Road, Patna. Phone, email, WhatsApp, opening hours, directions and a working contact form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Visit & contact"
        title={
          <>
            Find us on
            <br />
            <span className="text-signal">Fraser Road.</span>
          </>
        }
        lede="Demo contact details for a fictional gym. The form below is fully functional in this project: it validates on the server, stores your message and emails the front desk when Resend is configured."
        image={media.training.exterior}
      />

      <section className="pb-16">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          {/* details */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="eyebrow">Reach us</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                  <div>
                    <p className="text-fog">
                      {gym.address.line1}, {gym.address.line2}
                    </p>
                    <a
                      href={gymDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-signal hover:underline"
                    >
                      Get directions <Navigation size={11} aria-hidden="true" />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                  <a href={gym.phoneHref} className="break-all text-fog hover:text-signal">
                    {gym.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                  <a href={`mailto:${gym.email}`} className="break-all text-fog hover:text-signal">
                    {gym.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle size={17} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-fog hover:text-signal">
                    WhatsApp the front desk
                  </a>
                </li>
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="eyebrow flex items-center gap-2">
                <Clock size={12} className="text-signal" aria-hidden="true" /> Opening hours
              </h2>
              <dl className="mt-4 space-y-3">
                {gym.hours.map((entry) => (
                  <div key={entry.days} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-fog/90">
                      {entry.days}
                      <span className="block text-[0.6875rem] text-ash">{entry.note}</span>
                    </dt>
                    <dd className="whitespace-nowrap font-mono text-xs text-fog">
                      {entry.opens} – {entry.closes}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Live Google Maps embed. The panel behind the iframe keeps the
                address and a direct directions link usable if the embed is
                blocked (offline, strict CSP, cookie-less sandbox). */}
            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-coal">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center">
                <MapPin size={20} className="text-signal" aria-hidden="true" />
                <p className="text-sm text-fog">{gym.address.full}</p>
                <a
                  href={gymDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-signal underline underline-offset-4"
                >
                  Open in Google Maps
                </a>
              </div>
              <iframe
                title={`Map showing ${gym.name} near ${gym.address.full}`}
                src={gymMapEmbedUrl}
                width="100%"
                height="300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="relative block w-full grayscale-[35%] contrast-[1.05]"
                allowFullScreen
              />
            </div>
            <p className="text-[0.6875rem] leading-relaxed text-ash/60">
              The map is a live Google Maps embed for the Fraser Road area; the panel behind it keeps the
              address and directions reachable if the embed cannot load.
            </p>
          </div>

          {/* form */}
          <Reveal variant="up" className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-5">
              <h2 className="display text-[clamp(1.8rem,3.6vw,2.6rem)]">Send a message</h2>
              <p className="mt-2 text-sm text-ash">
                Tell us your training history and what you want from a membership — we will reply with a plan.
              </p>
            </div>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
