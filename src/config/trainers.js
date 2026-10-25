/**
 * Coaching team shown on the homepage and the Coaches page. Replace names,
 * bios and portraits with real staff details before launch.
 */
export const trainers = [
  {
    id: "coach-arjun",
    name: "Arjun Mehta",
    role: "Head strength coach",
    initials: "AM",
    focus: ["Powerlifting", "Barbell technique", "Return to lifting"],
    years: 11,
    bio: "Arjun runs the barbell coaching program and the Saturday technique clinic. He favours slow, repeatable progressions over program hopping, and keeps a chalk bowl within reach at all times.",
    image: {
      src: "/images/trainers/trainer-01.jpg",
      width: 900,
      height: 1100,
      alt: "Coach steadying a barbell during a training session (stock photograph)",
    },
    availability: "Mon–Sat · floor hours",
  },
  {
    id: "coach-sana",
    name: "Sana Qureshi",
    role: "Strength & mobility coach",
    initials: "SQ",
    focus: ["Mobility", "Hypertrophy", "Beginner onboarding"],
    years: 7,
    bio: "Sana handles most new-member onboarding and the mobility block that opens every group session. Her rule for the first six weeks: own the range before you add the weight.",
    image: {
      src: "/images/trainers/trainer-02.jpg",
      width: 900,
      height: 1100,
      alt: "Member training with a resistance band (stock photograph)",
    },
    availability: "Tue–Sun · mornings",
  },
  {
    id: "coach-rahul",
    name: "Rahul Verma",
    role: "Conditioning coach",
    initials: "RV",
    focus: ["Metabolic conditioning", "Sled & carries", "Rowing technique"],
    years: 6,
    bio: "Rahul writes the conditioning block that members either love or negotiate about. Expect sled pushes, loaded carries and intervals that respect your heart rate zones.",
    image: {
      src: "/images/trainers/trainer-03.jpg",
      width: 900,
      height: 1100,
      alt: "Athlete working with a battle rope (stock photograph)",
    },
    availability: "Mon–Sat · evenings",
  },
  {
    id: "coach-nidhi",
    name: "Nidhi Rane",
    role: "Assessments & programming",
    initials: "NR",
    focus: ["Assessments", "Program design", "Progressive overload"],
    years: 8,
    bio: "Nidhi runs the fitness assessments included with quarterly and annual plans, then turns the numbers into a four-week block members can actually follow.",
    image: {
      src: "/images/trainers/trainer-04.jpg",
      width: 900,
      height: 1100,
      alt: "Coach reviewing a training plan with a member (stock photograph)",
    },
    availability: "Wed–Sun · by appointment",
  },
];

export const trainingPrinciples = [
  {
    step: "01",
    title: "Assess before you prescribe",
    body: "Every coached plan starts with a movement screen and a short conversation about training history, schedule and injuries. No assessment, no template.",
  },
  {
    step: "02",
    title: "Build the base, then load it",
    body: "Technique volume comes first. We add load only when the pattern is repeatable under fatigue — that is the difference between a good month and a wasted one.",
  },
  {
    step: "03",
    title: "Progress in writing",
    body: "Your block is written down and reviewed every four weeks. If the numbers are not moving, we change one variable at a time instead of starting over.",
  },
];
