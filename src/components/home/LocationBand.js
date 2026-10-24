import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import { gym, gymDirectionsUrl, whatsappUrl } from "@/config/gym";
import { media } from "@/config/media";

/** Location, hours and contact — with a real directions link (no fake map). */
export default function LocationBand() {
  return (
    <section className="section border-t border-white/10 bg-coal" aria-labelledby="visit-heading">
      <div className="shell grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <span className="eyebrow">Visit</span>
          <h2 id="visit-heading" className="display mt-4 text-[clamp(2rem,4.6vw,3.6rem)]">
            Fraser Road,
            <br />
            <span className="text-ash/60">Patna.</span>
          </h2>
          <p className="lede mt-5 max-w-md">
            Walk in during staffed hours for a floor tour. If you are coming from outside Patna, call ahead and
            we will keep a coach free.
          </p>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="eyebrow flex items-center gap-2">
                <MapPin size={12} className="text-signal" aria-hidden="true" /> Address
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-fog/90">
                {gym.address.line1}
                <br />
                {gym.address.line2}
              </dd>
              <a
                href={gymDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-signal hover:underline"
              >
                Get directions <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </div>

            <div>
              <dt className="eyebrow flex items-center gap-2">
                <Clock size={12} className="text-signal" aria-hidden="true" /> Hours
              </dt>
              <dd className="mt-2 space-y-2 text-sm text-fog/90">
                {gym.hours.map((entry) => (
                  <div key={entry.days}>
                    <p className="text-xs text-ash">{entry.days}</p>
                    <p className="font-mono text-[0.8125rem]">
                      {entry.opens} – {entry.closes}
                    </p>
                  </div>
                ))}
              </dd>
            </div>

            <div>
              <dt className="eyebrow flex items-center gap-2">
                <Phone size={12} className="text-signal" aria-hidden="true" /> Call
              </dt>
              <dd className="mt-2">
                <a href={gym.phoneHref} className="text-sm text-fog/90 hover:text-fog">
                  {gym.phone}
                </a>
              </dd>
            </div>

            <div>
              <dt className="eyebrow flex items-center gap-2">
                <Mail size={12} className="text-signal" aria-hidden="true" /> Email
              </dt>
              <dd className="mt-2 break-all">
                <a href={`mailto:${gym.email}`} className="text-sm text-fog/90 hover:text-fog">
                  {gym.email}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-light">
              Contact us <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>

        <Reveal variant="right" className="relative">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <SmartImage
              src={media.training.exterior.src}
              alt={media.training.exterior.alt}
              sizes="(max-width: 1024px) 92vw, 560px"
              className="aspect-[4/3] w-full"
              imgClassName="object-cover"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink/60 px-4 py-3">
            <p className="text-xs text-ash">
              <span className="text-fog">Sunday open gym</span> · 7:00 AM – 12:00 PM
            </p>
            <a
              href={gymDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-signal hover:underline"
            >
              Open in Maps <ArrowUpRight size={11} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
