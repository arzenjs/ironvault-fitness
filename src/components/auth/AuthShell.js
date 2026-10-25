import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { VaultMark } from "@/components/ui/Logo";
import { media } from "@/config/media";

/** Two-column auth layout: form on the left, brand panel on the right. */
export default function AuthShell({ title, subtitle, children, footer, sideImage = media.training.cta }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-center px-5 pb-14 pt-24 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="IronVault Fitness home">
            <VaultMark size={30} className="text-fog" />
            <span className="display font-display text-xl">
              Iron<span className="text-signal">Vault</span>
            </span>
          </Link>

          <h1 className="display mt-9 text-[clamp(2rem,4vw,2.8rem)]">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm leading-relaxed text-ash">{subtitle}</p> : null}

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6 text-sm text-ash">{footer}</div> : null}

        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-white/10 lg:block">
        <SmartImage
          src={sideImage.src}
          alt=""
          sizes="50vw"
          className="absolute inset-0 h-full w-full"
          imgClassName="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/55 to-ink/85" aria-hidden="true" />
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.24em] text-signal">IronVault Fitness</p>
          <p className="display mt-4 max-w-sm text-[clamp(2rem,3.2vw,3rem)] leading-[0.95]">
            Built for strength.
            <br />
            Designed for progress.
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash">
            Your membership, payment history and plan dates live in one place once you sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
