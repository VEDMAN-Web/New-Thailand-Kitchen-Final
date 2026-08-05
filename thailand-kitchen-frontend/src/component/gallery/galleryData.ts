export type GalleryCategory =
  | "All"
  | "Layout & Space"
  | "Storage"
  | "Style & Color"
  | "Materials";

export interface GalleryItem {
  id: number;
  image: string;
  title: string;
  filter: GalleryCategory;
  tall?: boolean;
  wide?: boolean;
}

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Layout & Space",
  "Storage",
  "Style & Color",
  "Materials",
];

export const galleryHero = {
  eyebrow: "The Gallery · Vol. 04",
  title: "Kitchens of the island, moments of everyday luxury.",
  description:
    "A curated inspiration library of tropical, modern and minimal kitchens crafted by our Samui atelier — filter by style, layout, palette or material and discover your next design.",
  // [leftTop, rightTop, leftBottom, rightBottom]
  collage: [
    "/products/Kitchen2.png",
    "/products/Kitchen3.png",
    "/features/image2.png",
    "/products/Kitchen1.png",
  ] as [string, string, string, string],
};

export const galleryItems: GalleryItem[] = [
  { id: 1, image: "/products/Kitchen1.png", title: "Obsidian Island", filter: "Layout & Space", tall: true },
  { id: 2, image: "/products/Kitchen2.png", title: "Pearl Straight", filter: "Style & Color" },
  { id: 3, image: "/features/image.png", title: "Tailored Corner", filter: "Storage" },
  { id: 4, image: "/products/Kitchen4.png", title: "Midnight Gallery", filter: "Materials", tall: true },
  { id: 5, image: "/catlog/catlog.png", title: "Soft Horizon", filter: "Style & Color" },
  { id: 6, image: "/products/Kitchen3.png", title: "Warm Atelier", filter: "Materials" },
  { id: 7, image: "/features/image3.png", title: "Quiet Living", filter: "Layout & Space", tall: true },
  // { id: 8, image: "/products/Kitchen5.png", title: "Shadow Ridge", filter: "Storage" },
  // { id: 9, image: "/catlog/catlog (1).png", title: "Heritage Wing", filter: "Materials" },
  // { id: 10, image: "/products/Kitchen6.png", title: "Coastal Line", filter: "Style & Color" },
  // { id: 11, image: "/features/image2.png", title: "Crafted Corner", filter: "Storage" },
  // { id: 12, image: "/products/Kitchen4.png", title: "Island Retreat", filter: "Layout & Space", wide: true },
];
