import { media } from "./media";

/**
 * Facilities shown on the homepage and the dedicated Facilities page.
 * Keep descriptions and equipment counts in sync with the real floor.
 */
export const facilities = [
  {
    id: "strength",
    number: "01",
    title: "Strength & free weights",
    summary:
      "Six power racks, four calibrated platforms and a full run of barbells from 7.5 kg to 30 kg. Plates are colour-coded so you can load a set without hunting.",
    details: [
      "6 power racks with adjustable safety arms",
      "4 lifting platforms with bumper plates",
      "Barbells from 7.5 kg to 30 kg",
      "Fixed and adjustable benches",
    ],
    image: media.facilities.strength,
  },
  {
    id: "resistance",
    number: "02",
    title: "Resistance machinery",
    summary:
      "Plate-loaded and selectorised machines for accessory work — rows, presses, hinges and isolation. Every machine carries a small card explaining the setup.",
    details: [
      "Plate-loaded chest and back machines",
      "Cable stacks with a full attachment wall",
      "Dumbbells from 2 kg to 50 kg",
      "Dedicated glute-ham and leg press zones",
    ],
    image: media.facilities.resistance,
  },
  {
    id: "cardio",
    number: "03",
    title: "Cardio & conditioning",
    summary:
      "Treadmills, rowers, skiers and bikes along the window line, plus an open stretch area for warm-ups and cool-downs.",
    details: [
      "Treadmills, rowers, skiers and assault bikes",
      "Heart-rate friendly low-impact options",
      "Open stretch and warm-up area",
      "Floor mats and mobility tools",
    ],
    image: media.facilities.cardio,
  },
  {
    id: "functional",
    number: "04",
    title: "Functional turf",
    summary:
      "A 14-metre turf lane for sleds, carries and rope work — the part of the floor where members learn to move before they load.",
    details: [
      "14 m turf lane with sled and carry space",
      "Battle ropes, kettlebells, medicine balls",
      "Plyo boxes and resistance bands",
      "Small-group conditioning sessions",
    ],
    image: media.facilities.functional,
  },
  {
    id: "lockers",
    number: "05",
    title: "Lockers & changing",
    summary:
      "Changing rooms with day lockers, showers and grooming counters. Bring a padlock or rent one at the front desk for the session.",
    details: [
      "Day lockers for every member",
      "Showers and changing cubicles",
      "Grooming counters with mirrors",
      "Filtered drinking water stations",
    ],
    image: media.facilities.lockers,
  },
];
