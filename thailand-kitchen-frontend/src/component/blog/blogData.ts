export type BlogCategory =
  | "All"
  | "Layout & Space"
  | "Storage"
  | "Style & Color"
  | "Materials";

/** Translated copy authored in the admin panel. Blank fields fall back to English. */
export interface BlogTranslation {
  title?: string;
  excerpt?: string;
  category?: string;
  subsectionTitle?: string;
  quote?: string;
  quoteAuthor?: string;
  content?: string[];
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  filter: BlogCategory;
  date: string;
  /** Raw date so the UI can re-format per locale */
  dateISO?: string;
  readTime: string;
  image: string;
  gallery?: [string, string];
  subsectionTitle?: string;
  quote?: string;
  quoteAuthor?: string;
  featured?: boolean;
  featuredLayout?: "image-left" | "image-right";
  content: string[];
  translations?: { th?: BlogTranslation; pl?: BlogTranslation };
}

const IMG1 = "/blog/blogImage (1).jpg";
const IMG2 = "/blog/blogImage (2).jpg";
const IMG3 = "/blog/blogImage (3).jpg";

export const blogCategories: BlogCategory[] = [
  "All",
  "Layout & Space",
  "Storage",
  "Style & Color",
  "Materials",
];

export const blogHero = {
  eyebrow: "The Journal",
  title: "Blogs",
  description:
    "We believe in the soul of teak wood and the precision of ancient joining techniques. Discover stories of craft, design, and modern Thai kitchen living.",
  image: "/product/product.png",
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "the-art-of-teak",
    title:
      "The Art of Teak: Why Heritage Timber Remains the Ultimate Kitchen Luxury",
    excerpt:
      "From grain to finish, teak brings warmth, strength, and lasting character to every kitchen we craft—rooted in Thai heritage and modern living.",
    category: "Craftsmanship",
    filter: "Materials",
    date: "MAY 12, 2024",
    readTime: "8 MIN READ",
    image: IMG1,
    gallery: [IMG2, IMG3],
    featured: true,
    featuredLayout: "image-left",
    subsectionTitle: "A Legacy of Resilience",
    quote:
      "Teak is alive. Even after it is carved into cabinetry, it breathes with the room. Our job is to listen to the grain and let it guide the chisel.",
    quoteAuthor: "Master Craftsman, Lead Artisan",
    content: [
      "Teak has long been prized across Thailand for its natural oils, rich grain, and remarkable resistance to moisture. In the kitchen—where heat, steam, and daily use put materials to the test—this heritage timber still stands as one of the most refined choices available.",
      "Every board we select is evaluated for grain direction, colour depth, and structural integrity. The goal is not only beauty, but performance that ages with grace over decades.",
      "Our craftsmen combine traditional joining techniques with modern kitchen engineering, creating cabinetry that feels rooted in Thai heritage while serving contemporary life.",
      "Whether you prefer a warm heritage palette or a quieter, light-toned finish, teak remains a material that elevates the entire kitchen experience—tactile, enduring, and unmistakably premium.",
    ],
  },
  {
    id: 2,
    slug: "open-concept-kitchen-design",
    title:
      "Open Concept Living: Designing a Kitchen That Connects the Whole Home",
    excerpt:
      "An open kitchen can become the heart of family life. Here’s how thoughtful layout and proportion create flow without sacrificing function.",
    category: "Layout & Space",
    filter: "Layout & Space",
    date: "APR 28, 2024",
    readTime: "6 MIN READ",
    image: IMG2,
    gallery: [IMG1, IMG3],
    featured: true,
    featuredLayout: "image-right",
    subsectionTitle: "Designing for Connection",
    quote:
      "A kitchen should invite people in—not push them to the edges of the room.",
    quoteAuthor: "Thailand Kitchens Design Studio",
    content: [
      "Open-concept kitchens succeed when they balance cooking needs with social connection. Sight lines, island placement, and ceiling rhythm all shape how a room feels.",
      "We begin by mapping movement: prep zone, cooking zone, and storage must support daily habits without blocking conversation areas.",
      "Material continuity between kitchen and living spaces helps the home read as one composition, while subtle changes in texture keep each zone distinct.",
      "The result is a kitchen that hosts, cooks, and lives equally well—designed around how you actually use the home.",
    ],
  },
  {
    id: 3,
    slug: "the-marble-masterclass",
    title: "The Marble Masterclass: Selecting the Perfect Slab",
    excerpt:
      "Choosing marble is equal parts aesthetics and practicality. Learn how to select a slab that suits cooking style, light, and long-term care.",
    category: "Material Guides",
    filter: "Materials",
    date: "APR 10, 2024",
    readTime: "7 MIN READ",
    image: IMG3,
    gallery: [IMG1, IMG2],
    subsectionTitle: "Reading the Stone",
    quote:
      "Every slab tells a story in its veins—choose the one that feels calm in your light.",
    quoteAuthor: "Material Specialist",
    content: [
      "Marble brings a quiet luxury to kitchen surfaces—soft veining, cool touch, and timeless presence. Selecting the right slab begins with understanding how you cook and clean.",
      "Look carefully at vein movement and colour variation under both daylight and evening lighting. A slab that feels calm in the showroom should still feel balanced in your home.",
      "Sealing and maintenance matter. With proper care, marble can remain beautiful for years while adding a signature note to your kitchen design.",
    ],
  },
  {
    id: 4,
    slug: "living-in-the-heart-of-the-home",
    title: "Living in the Heart of the Home: Kitchen as Hub",
    excerpt:
      "Beyond cooking, the kitchen is where daily life gathers. Design choices that welcome people make the space feel alive all day.",
    category: "Lifestyle",
    filter: "Style & Color",
    date: "MAR 22, 2024",
    readTime: "5 MIN READ",
    image: IMG1,
    gallery: [IMG2, IMG3],
    subsectionTitle: "Life Around the Island",
    quote:
      "The best kitchens hold more than meals—they hold the rhythm of the day.",
    quoteAuthor: "Thailand Kitchens",
    content: [
      "A kitchen becomes the heart of the home when it invites lingering—morning coffee, homework at the island, and evening conversation after dinner.",
      "Comfortable seating, soft lighting, and durable finishes let the kitchen support many moods without feeling fragile.",
      "When design anticipates real life, the kitchen stays welcoming every hour of the day.",
    ],
  },
  {
    id: 5,
    slug: "functional-flow-ergonomics",
    title: "Functional Flow: Ergonomics in the Modern Kitchen",
    excerpt:
      "Good kitchens feel effortless because reach, height, and movement are planned with intention—reducing strain while increasing efficiency.",
    category: "Design Trends",
    filter: "Layout & Space",
    date: "MAR 05, 2024",
    readTime: "6 MIN READ",
    image: IMG2,
    gallery: [IMG1, IMG3],
    subsectionTitle: "Movement Without Friction",
    quote:
      "When reach and height are right, cooking feels natural—not like work.",
    quoteAuthor: "Design Studio",
    content: [
      "Ergonomics transforms everyday cooking. Worktop height, drawer access, and appliance placement determine how natural each task feels.",
      "We design around your height, habits, and most-used tools so the kitchen supports you rather than asking you to adapt.",
      "Small adjustments—like pull-out storage near the prep zone—create flow that you notice every single day.",
    ],
  },
];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 2): BlogPost[] {
  return blogPosts.filter((post) => post.slug !== slug).slice(0, limit);
}
