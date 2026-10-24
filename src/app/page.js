import Hero from "@/components/home/Hero";
import BrandStatement from "@/components/home/BrandStatement";
import StatsBand from "@/components/home/StatsBand";
import Marquee from "@/components/ui/Marquee";
import FacilitiesPreview from "@/components/home/FacilitiesPreview";
import Philosophy from "@/components/home/Philosophy";
import TrainersPreview from "@/components/home/TrainersPreview";
import MembershipSection from "@/components/home/MembershipSection";
import GalleryPreview from "@/components/home/GalleryPreview";
import Testimonials from "@/components/home/Testimonials";
import FaqPreview from "@/components/home/FaqPreview";
import LocationBand from "@/components/home/LocationBand";
import FinalCta from "@/components/home/FinalCta";
import { gym } from "@/config/gym";

export const metadata = {
  title: `${gym.name} — Premium Strength Gym in Patna`,
  description:
    "IronVault Fitness is a strength-first gym on Fraser Road, Patna. Calibrated barbell stations, coached programming and flexible monthly, quarterly and annual memberships.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStatement />
      <StatsBand />
      <Marquee
        items={["Strength", "Conditioning", "Coaching", "Barbell Club", "Mobility", "Open 17 hrs"]}
        duration={44}
      />
      <FacilitiesPreview />
      <Philosophy />
      <TrainersPreview />
      <MembershipSection />
      <GalleryPreview />
      <Testimonials />
      <FaqPreview />
      <LocationBand />
      <FinalCta />
    </>
  );
}
