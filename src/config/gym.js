/**
 * Single source of truth for gym identity and contact details.
 * These are fictional portfolio-demo details — see README.
 */
export const gym = {
  name: "IronVault Fitness",
  shortName: "IronVault",
  tagline: "Built for Strength. Designed for Progress.",
  legalName: "IronVault Fitness (portfolio demo)",
  description:
    "A premium strength-first gym in Patna — calibrated equipment, coached programming, and a floor built for serious training.",
  address: {
    line1: "Fraser Road",
    line2: "Patna, Bihar 800001",
    country: "India",
    full: "Fraser Road, Patna, Bihar, India",
  },
  phone: "+91 98765 12340",
  phoneHref: "tel:+919876512340",
  whatsapp: "919876512340",
  email: "hello@ironvault.example",
  mapsQuery: "Fraser Road, Patna, Bihar, India",
  currency: "INR",
  hours: [
    { days: "Monday – Saturday", opens: "5:30 AM", closes: "10:00 PM", note: "Full floor access" },
    { days: "Sunday", opens: "7:00 AM", closes: "12:00 PM", note: "Open gym only" },
  ],
  // Sample figures for the demo — clearly labelled as demo content in the UI.
  stats: [
    { value: 1240, suffix: "+", label: "Members trained", note: "Demo figure" },
    { value: 62, suffix: "", label: "Calibrated barbell stations", note: "Racks, platforms" },
    { value: 9, suffix: "", label: "Coaches on the floor", note: "Strength & conditioning" },
    { value: 17, suffix: "hrs", label: "Open every weekday", note: "5:30 AM – 10:00 PM" },
  ],
  established: 2019,
};

export const gymMapEmbedUrl =
  "https://www.google.com/maps?q=" + encodeURIComponent(gym.mapsQuery) + "&hl=en&z=15&output=embed";

export const gymDirectionsUrl =
  "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(gym.mapsQuery);

export const gymMapsSearchUrl =
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(gym.mapsQuery);

export const whatsappUrl = `https://wa.me/${gym.whatsapp}?text=${encodeURIComponent(
  "Hi IronVault Fitness — I'd like to know more about memberships.",
)}`;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ironvault.example";
