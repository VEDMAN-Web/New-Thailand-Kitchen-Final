/** Canonical Journal articles shown on live /journal (mirrors frontend fallbackBlogs). */
export type JournalArticleSeed = {
  seedKey: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  order: number;
};

export const JOURNAL_ARTICLE_SEEDS: JournalArticleSeed[] = [
  {
    "seedKey": "blog-1",
    "title": "10 Interior Design Trends That Will Transform Your Home in 2026",
    "excerpt": "From warm minimalism to sculptural lighting — discover the trends shaping beautiful, livable interiors this year.",
    "category": "interior-design",
    "date": "12 March 2026",
    "readTime": "6 min",
    "image": "/home/featured/feature-3.jpg",
    "author": "Courtney Henry",
    "order": 1
  },
  {
    "seedKey": "blog-2",
    "title": "How to Choose the Perfect Modular Kitchen for Your Home",
    "excerpt": "Layout, storage, finishes, and workflow — a practical guide to selecting cabinetry that works beautifully every day.",
    "category": "kitchens",
    "date": "Dec 28, 2025",
    "readTime": "5 min",
    "image": "/home/featured/feature-5.jpg",
    "author": "Marco Rossi",
    "order": 2
  },
  {
    "seedKey": "blog-3",
    "title": "The Art of Layered Lighting in Modern Interiors",
    "excerpt": "Ambient, task, and accent lighting work together to shape mood, function, and visual depth in every room.",
    "category": "interior-design",
    "date": "Dec 10, 2025",
    "readTime": "4 min",
    "image": "/home/featured/feature-7.jpg",
    "author": "Priya Shah",
    "order": 3
  },
  {
    "seedKey": "blog-4",
    "title": "Small Space, Big Impact: Smart Storage Solutions",
    "excerpt": "Clever cabinetry, vertical storage, and multi-functional furniture help compact homes feel spacious and organized.",
    "category": "interior-design",
    "date": "Nov 22, 2025",
    "readTime": "5 min",
    "image": "/home/featured/feature-4.jpg",
    "author": "Elena Varsovia",
    "order": 4
  },
  {
    "seedKey": "blog-5",
    "title": "Material Matters: Choosing Finishes That Age Gracefully",
    "excerpt": "Quartz, laminates, solid wood, and veneers — how to pick surfaces that look better over time, not worse.",
    "category": "materials",
    "date": "Nov 05, 2025",
    "readTime": "7 min",
    "image": "/home/featured/feature-6.jpg",
    "author": "Marco Rossi",
    "order": 5
  },
  {
    "seedKey": "blog-6",
    "title": "Creating a Cohesive Whole-House Design Language",
    "excerpt": "Consistency across rooms doesn't mean repetition — learn how to carry color, texture, and proportion throughout your home.",
    "category": "interior-design",
    "date": "Oct 18, 2025",
    "readTime": "6 min",
    "image": "/home/featured/feature-3.jpg",
    "author": "Priya Shah",
    "order": 6
  },
  {
    "seedKey": "blog-7",
    "title": "Bathroom Retreats: Spa-Inspired Design at Home",
    "excerpt": "Soft lighting, stone textures, and floating vanities turn everyday bathrooms into restorative sanctuaries.",
    "category": "interior-design",
    "date": "Oct 02, 2025",
    "readTime": "4 min",
    "image": "/home/blog/blog-1.jpg",
    "author": "Elena Varsovia",
    "order": 7
  },
  {
    "seedKey": "blog-8",
    "title": "Color Psychology in Interior Design",
    "excerpt": "How warm and cool tones influence mood, perceived space, and the way natural light behaves in your rooms.",
    "category": "interior-design",
    "date": "Sep 14, 2025",
    "readTime": "5 min",
    "image": "/home/featured/feature-2.jpg",
    "author": "Marco Rossi",
    "order": 8
  },
  {
    "seedKey": "blog-9",
    "title": "Working With an Interior Designer: What to Expect",
    "excerpt": "From first consultation to final installation — a transparent look at the Varsovia design process.",
    "category": "interior-design",
    "date": "Aug 30, 2025",
    "readTime": "6 min",
    "image": "/home/blog/blog-1.jpg",
    "author": "Priya Shah",
    "order": 9
  },
  {
    "seedKey": "blog-10",
    "title": "Top Trends Transforming Modern Interior Design Showrooms in 2026",
    "excerpt": "From immersive displays to tactile material libraries — how leading showrooms are redefining the way clients experience design.",
    "category": "interior-design",
    "date": "12 Jun 2026",
    "readTime": "4 min",
    "image": "/home/featured/feature-1.jpg",
    "author": "Courtney Henry",
    "order": 10
  },
  {
    "seedKey": "blog-11",
    "title": "Open-Plan Living Without Losing Definition",
    "excerpt": "Zoning tricks, ceiling treatments, and furniture placement that keep open layouts feeling structured and calm.",
    "category": "thailand-living",
    "date": "28 May 2026",
    "readTime": "5 min",
    "image": "/home/featured/feature-2.jpg",
    "author": "Elena Varsovia",
    "order": 11
  },
  {
    "seedKey": "blog-12",
    "title": "Bedroom Wardrobes That Maximize Every Centimeter",
    "excerpt": "Custom internals, sliding systems, and lighting ideas for wardrobes that feel boutique-hotel refined.",
    "category": "interior-design",
    "date": "14 May 2026",
    "readTime": "4 min",
    "image": "/home/featured/feature-3.jpg",
    "author": "Priya Shah",
    "order": 12
  },
  {
    "seedKey": "blog-13",
    "title": "Door & Window Profiles That Frame the View",
    "excerpt": "Slim frames, warm timber, and performance glazing — selecting openings that connect indoors with landscape.",
    "category": "interior-design",
    "date": "30 Apr 2026",
    "readTime": "6 min",
    "image": "/home/featured/feature-4.jpg",
    "author": "Marco Rossi",
    "order": 13
  },
  {
    "seedKey": "blog-14",
    "title": "Furniture Layout Mistakes — and How to Fix Them",
    "excerpt": "Common spacing errors in sofas, dining tables, and media walls that make rooms feel smaller than they are.",
    "category": "furniture",
    "date": "16 Apr 2026",
    "readTime": "5 min",
    "image": "/home/featured/feature-5.jpg",
    "author": "Courtney Henry",
    "order": 14
  },
  {
    "seedKey": "blog-15",
    "title": "Kitchen Islands: Size, Height, and Seating Done Right",
    "excerpt": "Proportions, overhang depth, and power planning for islands that anchor the heart of the home.",
    "category": "kitchens",
    "date": "02 Apr 2026",
    "readTime": "5 min",
    "image": "/home/featured/feature-6.jpg",
    "author": "Elena Varsovia",
    "order": 15
  },
  {
    "seedKey": "blog-16",
    "title": "Sustainable Materials Without Compromising Luxury",
    "excerpt": "Responsible sourcing, low-VOC finishes, and durable cores that meet premium aesthetic expectations.",
    "category": "materials",
    "date": "19 Mar 2026",
    "readTime": "7 min",
    "image": "/home/featured/feature-7.jpg",
    "author": "Marco Rossi",
    "order": 16
  },
  {
    "seedKey": "blog-17",
    "title": "Designing Guest Suites That Feel Like a Boutique Stay",
    "excerpt": "Layered bedding, integrated storage, and subtle lighting for spaces your visitors will remember.",
    "category": "interior-design",
    "date": "05 Mar 2026",
    "readTime": "4 min",
    "image": "/home/blog/blog-1.jpg",
    "author": "Priya Shah",
    "order": 17
  },
  {
    "seedKey": "blog-18",
    "title": "Powder Rooms: Small Spaces, Strong First Impressions",
    "excerpt": "Bold stone, mirrored cabinetry, and sculptural fixtures that elevate compact washrooms.",
    "category": "interior-design",
    "date": "20 Feb 2026",
    "readTime": "3 min",
    "image": "/home/blog/blog-1.jpg",
    "author": "Courtney Henry",
    "order": 18
  },
  {
    "seedKey": "blog-19",
    "title": "Home Office Joinery That Hides the Clutter",
    "excerpt": "Cable management, adjustable shelves, and acoustic panels for focused work from home.",
    "category": "furniture",
    "date": "06 Feb 2026",
    "readTime": "5 min",
    "image": "/home/blog/blog-1.jpg",
    "author": "Elena Varsovia",
    "order": 19
  },
  {
    "seedKey": "blog-20",
    "title": "Outdoor Kitchens for Tropical Climates",
    "excerpt": "Ventilation, shade, and weather-resistant cabinetry for seamless indoor–outdoor entertaining.",
    "category": "kitchens",
    "date": "23 Jan 2026",
    "readTime": "6 min",
    "image": "/home/featured/feature-1.jpg",
    "author": "Marco Rossi",
    "order": 20
  },
  {
    "seedKey": "blog-21",
    "title": "Accent Walls That Don't Feel Dated",
    "excerpt": "Paneling, limewash, and full-height stone — modern alternatives to yesterday's feature walls.",
    "category": "interior-design",
    "date": "09 Jan 2026",
    "readTime": "4 min",
    "image": "/home/featured/feature-2.jpg",
    "author": "Priya Shah",
    "order": 21
  },
  {
    "seedKey": "blog-22",
    "title": "Planning a Whole-House Renovation Timeline",
    "excerpt": "Phasing trades, lead times, and client decisions so projects stay on track from demo to styling.",
    "category": "interior-design",
    "date": "26 Dec 2025",
    "readTime": "8 min",
    "image": "/home/featured/feature-3.jpg",
    "author": "Courtney Henry",
    "order": 22
  },
  {
    "seedKey": "blog-23",
    "title": "Children's Rooms That Grow With the Family",
    "excerpt": "Flexible storage, durable finishes, and neutral bases that adapt as tastes change.",
    "category": "interior-design",
    "date": "12 Dec 2025",
    "readTime": "5 min",
    "image": "/home/featured/feature-4.jpg",
    "author": "Elena Varsovia",
    "order": 23
  },
  {
    "seedKey": "blog-24",
    "title": "Styling Shelves and Niches Like a Pro",
    "excerpt": "Balance, repetition, and negative space — simple rules for displays that look intentional, not crowded.",
    "category": "thailand-living",
    "date": "28 Nov 2025",
    "readTime": "4 min",
    "image": "/home/featured/feature-5.jpg",
    "author": "Priya Shah",
    "order": 24
  }
];

/** Avatars used on live journal cards / article bylines. */
export const JOURNAL_AUTHOR_AVATARS: Record<string, string> = {
  "Courtney Henry": "/home/about-1.png",
  "Marco Rossi": "/home/about-3.png",
  "Priya Shah": "/home/about-1.png",
  "Elena Varsovia": "/home/about-2.png",
};

/**
 * Canonical /journal/p/[id] body (same Figma blocks the live site shows).
 * Stored as CMS `{ heading, text, image }` so the admin panel matches the article.
 */
export const JOURNAL_DETAIL_COPY = {
  intro:
    "Interior design continues to evolve with changing lifestyles and modern living needs. In 2026, homeowners are embracing spaces that are elegant, functional, and personalized. Whether you're renovating a single room or designing your dream home, these trends will help you create interiors that are timeless and inspiring.",
  afterHero:
    "Interior design continues to evolve with changing lifestyles and modern living needs. In 2026, homeowners are embracing spaces that are elegant, functional, and personalized. Whether you're renovating a single room or designing your dream home, these trends will help you create interiors that are timeless and inspiring. Soft taupes, mushroom greys, and creamy off-whites continue to dominate palettes — paired with richer accents in wood, stone, and brushed metal so rooms never feel flat or cold. Curved silhouettes and soft edges continue to replace sharp, rigid forms. From arched doorways to rounded kitchen islands, these shapes create a sense of flow and make rooms feel more inviting without sacrificing structure.",
  captionWarm: "Warm Neutral Color Palettes",
  captionNatural: "Natural Materials & Layered Texture",
  splitLeft:
    "At **Varsovia Design**, we believe every project begins with understanding our clients' unique vision and lifestyle. Our approach combines creativity, craftsmanship, and innovative design solutions to create interiors that are elegant, functional, and built to stand the test of time. Whether you're renovating a single room, designing your dream home, or planning a complete interior transformation, staying informed about the latest design trends can help you make confident decisions and achieve exceptional results.",
  splitRight:
    "Natural stone, warm wood grains, and layered textiles add depth and character. The best interiors mix materials intentionally — pairing matte surfaces with subtle gloss, or smooth cabinetry with textured wall panels so every room feels layered, calm, and complete.",
  imageWarm: "/home/featured/feature-2.jpg",
  imageSplitLeft: "/home/featured/feature-3.jpg",
  imageSplitRight: "/home/featured/feature-4.jpg",
};

type LocMap = { en: string; th: string; pl: string };

export function journalDetailCmsSections(
  loc: (en: string, th?: string, pl?: string) => LocMap
) {
  const d = JOURNAL_DETAIL_COPY;
  return [
    { heading: loc(""), text: loc(d.intro), image: "" },
    { heading: loc(d.captionWarm), text: loc(""), image: d.imageWarm },
    { heading: loc(""), text: loc(d.afterHero), image: "" },
    { heading: loc(d.captionWarm), text: loc(d.splitLeft), image: d.imageSplitLeft, imagePosition: "left" },
    {
      heading: loc(d.captionNatural),
      text: loc(d.splitRight),
      image: d.imageSplitRight,
      imagePosition: "right",
    },
  ];
}

/** One leftover listing card, or empty — not the live Figma article body. */
export function isThinJournalArticleSections(sections: unknown): boolean {
  if (!Array.isArray(sections) || sections.length === 0) return true;
  if (sections.length >= 5) return false;
  return sections.length === 1;
}
