/** Live /catalogue brochure cards — Sync from DB on Free Catalogue mirrors this set. */

export type CatalogueBrochureSeed = {
  title: { en: string; th: string; pl: string };
  coverImage: string;
  downloadUrl: string;
  order: number;
};

export const CATALOGUE_BROCHURE_SEEDS: CatalogueBrochureSeed[] = [
  {
    title: {
      en: "Classic Collection 2026",
      th: "คอลเลกชันคลาสสิก 2026",
      pl: "Kolekcja Classic 2026",
    },
    coverImage: "/home/catalog.png",
    downloadUrl: "/catalogue",
    order: 1,
  },
  {
    title: {
      en: "Modern Living",
      th: "โมเดิร์นลิฟวิ่ง",
      pl: "Nowoczesne życie",
    },
    coverImage: "/home/catalog-1.jpg",
    downloadUrl: "/catalogue",
    order: 2,
  },
  {
    title: {
      en: "Explore Modern Design",
      th: "สำรวจดีไซน์โมเดิร์น",
      pl: "Odkryj nowoczesny design",
    },
    coverImage: "/home/catalog-2.png",
    downloadUrl: "/catalogue",
    order: 3,
  },
  {
    title: {
      en: "Warm Neutrals",
      th: "โทนกลางอุ่น",
      pl: "Ciepłe neutrale",
    },
    coverImage: "/home/catalog-3.png",
    downloadUrl: "/catalogue",
    order: 4,
  },
  {
    title: {
      en: "Urban Kitchens",
      th: "ครัวเมือง",
      pl: "Kuchnie miejskie",
    },
    coverImage: "/home/catalog-4.png",
    downloadUrl: "/catalogue",
    order: 5,
  },
  {
    title: {
      en: "Coastal Living",
      th: "ชีวิตชายฝั่ง",
      pl: "Życie nad morzem",
    },
    coverImage: "/home/catalog-2.png",
    downloadUrl: "/catalogue",
    order: 6,
  },
];
