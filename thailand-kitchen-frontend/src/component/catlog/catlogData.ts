export const products = [
  {
    id: 1,
    category: "Minimal",
    title: "2026 EDITION",
    image: "/catlog/catlog.png",
    pdf: "catalogue-minimal.pdf",
    downloadName: "Thailand-Kitchens-Catalogue-Minimal.pdf",
  },
  {
    id: 2,
    category: "Classic",
    title: "2026 EDITION",
    image: "/catlog/catlog (1).png",
    pdf: "catalogue-classic.pdf",
    downloadName: "Thailand-Kitchens-Catalogue-Classic.pdf",
  },
  {
    id: 3,
    category: "Modern",
    title: "2026 EDITION",
    image: "/catlog/catlog (2).png",
    pdf: "catalogue-modern.pdf",
    downloadName: "Thailand-Kitchens-Catalogue-Modern.pdf",
  },
  {
    id: 4,
    category: "Modern",
    title: "2026 EDITION",
    image: "/catlog/catlog.png",
    pdf: "catalogue.pdf",
    downloadName: "Thailand-Kitchens-Catalogue.pdf",
  },
];

/** Allowlist used by the secure download API */
export const catalogFiles = products.map((p) => ({
  id: p.id,
  pdf: p.pdf,
  downloadName: p.downloadName,
}));
