export type Project = {
  slug: string;
  number: string;
  title: string;
  category: "Architecture" | "Interiors" | "Finishing";
  place: string;
  year: string;
  image: string;
  alt: string;
  idea: string;
  description: string;
  material: string;
  imageNote: string;
};

export const projects: Project[] = [
  {
    slug: "dune-house",
    number: "01",
    title: "Dune House",
    category: "Architecture",
    place: "Coastal living",
    year: "2026",
    image: "aurel-hero",
    alt: "A quiet, warm-lit contemporary pavilion set in a coastal landscape at dusk",
    idea: "A house that belongs to the horizon.",
    description:
      "A speculative home shaped by long views, low rooflines and the changing coastal light. Solid walls offer shelter; generous openings give the landscape a place at the table. The architecture is imagined as a sequence of pauses between inside and out.",
    material: "Sandstone · smoked oak · patinated bronze",
    imageNote:
      "Original AI-generated architectural concept. An imagined residence, not a built commission.",
  },
  {
    slug: "quiet-gallery",
    number: "02",
    title: "The Quiet Gallery",
    category: "Interiors",
    place: "A study in stillness",
    year: "2026",
    image: "stair-hall",
    alt: "A sculptural travertine staircase with a fine bronze handrail and a narrow skylight",
    idea: "Room for light. Space for thought.",
    description:
      "An interior concept exploring the rhythm of a gallery: the measured interval, the deep reveal, the feeling of moving slowly. A stone stair anchors the space, while a restrained material palette makes daylight the changing element.",
    material: "Travertine · smoked oak · patinated bronze",
    imageNote:
      "Original AI-generated architectural concept. An imagined interior, not a built commission.",
  },
  {
    slug: "walnut-room",
    number: "03",
    title: "The Walnut Room",
    category: "Finishing",
    place: "Material & detail",
    year: "2026",
    image: "joinery-detail",
    alt: "A finely detailed walnut cabinet, bronze pull and vein-cut travertine worktop in warm raking light",
    idea: "The quiet precision of things made well.",
    description:
      "A finishing study in weight, grain and the meeting of surfaces. Deep timber tones meet a clean stone plane. Handles retreat into shadow; junctions become the detail. The ambition is a room that feels effortless because every decision has been considered.",
    material: "Walnut · honed stone · blackened brass",
    imageNote:
      "Original AI-generated finishing concept. An imagined material detail, not a built commission.",
  },
  {
    slug: "inner-sanctuary",
    number: "04",
    title: "Inner Sanctuary",
    category: "Interiors",
    place: "Private retreat",
    year: "2026",
    image: "sanctuary",
    alt: "A contemporary bedroom with warm timber finishes and soft natural window light",
    idea: "A softer way to inhabit the day.",
    description:
      "A private retreat imagined around the rituals of rest. Tactile timber, softened light and an unhurried arrangement of furniture create an interior that asks less of its occupant. Comfort is found in proportion, texture and what is left unsaid.",
    material: "Natural timber · woven wool · limewash",
    imageNote:
      "Photographic atmosphere reference by Marcel Strauß / Unsplash. The photograph depicts an existing interior and is not an AUREL design.",
  },
];

export const process = [
  {
    number: "01",
    title: "Listen closely.",
    subtitle: "Discovery & direction",
    copy: "Every space begins with a way of living. We explore daily rituals, the character of the site and the feeling a place should hold.",
  },
  {
    number: "02",
    title: "Find the essence.",
    subtitle: "Architecture & interiors",
    copy: "Proportion, movement and light become a clear spatial language. Architecture and interiors evolve together, from the first sketch.",
  },
  {
    number: "03",
    title: "Resolve the detail.",
    subtitle: "Material & finishing",
    copy: "Stone meets timber. Light grazes plaster. We consider the small junctions that make a space feel coherent, tactile and complete.",
  },
];
