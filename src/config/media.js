/**
 * Image inventory for the site. Every file below exists in public/images and is
 * downloaded (not hot-linked), so `next/image` can optimise it at build time.
 * Sources and licences are listed in README.md → Asset inventory.
 */
export const media = {
  hero: {
    athlete: {
      src: "/images/hero/hero-athlete.jpg",
      width: 1300,
      height: 1625,
      alt: "Athlete in a black singlet carrying a heavy dumbbell across a dark gym floor",
    },
    rope: {
      src: "/images/hero/hero-rope.jpg",
      width: 900,
      height: 1100,
      alt: "Lifter preparing a barbell for a heavy pull in low light",
    },
    aisle: {
      src: "/images/hero/hero-dumbbell-aisle.jpg",
      width: 1600,
      height: 900,
      alt: "Long rack of dumbbells inside a modern training floor",
    },
  },
  about: {
    barbell: {
      src: "/images/about/barbell-back.jpg",
      width: 1400,
      height: 900,
      alt: "Back of a lifter standing over a loaded barbell",
    },
    group: {
      src: "/images/about/group-training.jpg",
      width: 1200,
      height: 800,
      alt: "Coach guiding a member through a dumbbell session",
    },
    class: {
      src: "/images/about/group-class.jpg",
      width: 1200,
      height: 800,
      alt: "Two members working through a floor-based mobility circuit",
    },
    stretch: {
      src: "/images/about/floor-stretch.jpg",
      width: 1100,
      height: 1400,
      alt: "Member resting on a bench during a recovery block",
    },
  },
  facilities: {
    strength: {
      src: "/images/facilities/strength-rack.jpg",
      width: 1200,
      height: 900,
      alt: "Member setting up a barbell inside a power rack",
    },
    resistance: {
      src: "/images/facilities/resistance-dumbbells.jpg",
      width: 1200,
      height: 900,
      alt: "Hands gripping dumbbells during a resistance set",
    },
    cardio: {
      src: "/images/facilities/cardio-floor.jpg",
      width: 1200,
      height: 900,
      alt: "Cardio machines and open floor space in a bright gym hall",
    },
    functional: {
      src: "/images/facilities/functional-turf.jpg",
      width: 1200,
      height: 900,
      alt: "Member performing a floor-based core exercise on turf",
    },
    lockers: {
      src: "/images/facilities/locker-room.jpg",
      width: 1264,
      height: 848,
      alt: "Dark locker room with steel lockers, bench seating and warm lighting",
    },
  },
  training: {
    cta: {
      src: "/images/site/training-cta.jpg",
      width: 1600,
      height: 900,
      alt: "Athlete driving through a floor press on a dark gym floor",
    },
    community: {
      src: "/images/site/community.jpg",
      width: 1200,
      height: 800,
      alt: "Runners training at dusk in silhouette",
    },
    exterior: {
      src: "/images/site/gym-exterior.jpg",
      width: 1264,
      height: 848,
      alt: "Night view of the gym entrance with lit windows and neon signage",
    },
  },
};

export const galleryCategories = [
  { id: "all", label: "All" },
  { id: "strength", label: "Strength" },
  { id: "conditioning", label: "Conditioning" },
  { id: "floor", label: "The floor" },
  { id: "coaching", label: "Coaching" },
];

export const galleryImages = [
  {
    id: "g01",
    src: "/images/gallery/gallery-01.jpg",
    width: 1000,
    height: 1250,
    category: "strength",
    alt: "Lifter standing between dumbbell racks, mid-set",
  },
  {
    id: "g02",
    src: "/images/gallery/gallery-02.jpg",
    width: 1200,
    height: 800,
    category: "strength",
    alt: "Loaded barbell resting on a dark platform",
  },
  {
    id: "g03",
    src: "/images/gallery/gallery-03.jpg",
    width: 1200,
    height: 800,
    category: "floor",
    alt: "Stack of colour-coded calibrated weight plates",
  },
  {
    id: "g04",
    src: "/images/gallery/gallery-04.jpg",
    width: 1000,
    height: 1250,
    category: "strength",
    alt: "Athlete holding a barbell overhead inside a squat cage",
  },
  {
    id: "g05",
    src: "/images/gallery/gallery-05.jpg",
    width: 1000,
    height: 1250,
    category: "coaching",
    alt: "Coach holding a battle rope, looking toward the training floor",
  },
  {
    id: "g06",
    src: "/images/gallery/gallery-06.jpg",
    width: 1200,
    height: 800,
    category: "floor",
    alt: "Member seated in a calm stretch on a yoga mat",
  },
  {
    id: "g07",
    src: "/images/gallery/gallery-07.jpg",
    width: 1200,
    height: 800,
    category: "conditioning",
    alt: "Sled push conditioning drill on green turf",
  },
  {
    id: "g08",
    src: "/images/gallery/gallery-08.jpg",
    width: 1000,
    height: 1250,
    category: "coaching",
    alt: "Coach spotting a member during a bench press",
  },
  {
    id: "g09",
    src: "/images/gallery/gallery-09.jpg",
    width: 1200,
    height: 800,
    category: "conditioning",
    alt: "Athlete working through a high-intensity floor circuit",
  },
  {
    id: "g10",
    src: "/images/gallery/gallery-10.jpg",
    width: 1200,
    height: 800,
    category: "strength",
    alt: "Group of lifters training with barbells under low light",
  },
  {
    id: "g11",
    src: "/images/gallery/gallery-11.jpg",
    width: 1200,
    height: 800,
    category: "conditioning",
    alt: "Member finishing a core circuit on the studio floor",
  },
  {
    id: "g12",
    src: "/images/gallery/gallery-12.jpg",
    width: 1200,
    height: 800,
    category: "floor",
    alt: "Hex dumbbells arranged on a rack against a dark wall",
  },
  {
    id: "g13",
    src: "/images/gallery/gallery-13.jpg",
    width: 1000,
    height: 1250,
    category: "conditioning",
    alt: "Rope slams on the functional turf lane",
  },
  {
    id: "g14",
    src: "/images/gallery/gallery-14.jpg",
    width: 1200,
    height: 800,
    category: "strength",
    alt: "Lifter setting their grip on a loaded barbell",
  },
];
