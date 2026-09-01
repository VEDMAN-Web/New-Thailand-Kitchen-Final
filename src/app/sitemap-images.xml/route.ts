import {
  fetchMergedProducts,
  fetchHomeSections,
  fetchMergedGallery,
  fetchMergedBlogs,
  getIndexableCategories,
} from "../../services/cmsPublic";
import { categoryPublicPath } from "../../lib/categoryRoutes";
import { SITE_ORIGIN, ogImageUrl } from "../../lib/siteUrl";

function xmlEscape(value: unknown) {
  // CMS fields can be multilingual objects; sitemap only needs a stable string.
  const s = typeof value === "string" ? value : String(value ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absImageUrl(src: string) {
  const trimmed = String(src || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SITE_ORIGIN}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

type ImageEntry = { pageUrl: string; imageUrl: string; title?: string };

function pushImage(
  bucket: ImageEntry[],
  seen: Set<string>,
  pageUrl: string,
  imageUrl: string,
  title?: string
) {
  const abs = absImageUrl(imageUrl);
  if (!abs) return;
  const key = `${pageUrl}|${abs}`;
  if (seen.has(key)) return;
  seen.add(key);
  bucket.push({ pageUrl, imageUrl: abs, title });
}

export async function GET() {
  const entries: ImageEntry[] = [];
  const seen = new Set<string>();

  const staticPages = [
    "",
    "/products",
    "/kitchens",
    "/gallery",
    "/guides",
    "/services",
    "/materials",
    "/locations",
  ];

const home = await fetchHomeSections().catch(() => ({}) as Record<string, unknown>);
  const heroSection = (home as { hero?: Record<string, unknown> })?.hero || {};
  const seoSection = (home as { seo?: Record<string, unknown> })?.seo || {};
  const heroImage = ogImageUrl((seoSection.ogImage as string) || (heroSection.image as string) || "");
  
  for (const path of staticPages) {
          pushImage(entries, seen, `${SITE_ORIGIN}${path}`, heroImage, "Thailand Kitchens");
  }

  try {
    const products = await fetchMergedProducts();
    for (const product of products) {
      const pageUrl = `${SITE_ORIGIN}/products/${product.slug}`;
      const label = product.name || product.headline || product.slug;
      pushImage(entries, seen, pageUrl, product.image, label);
      for (const img of product.gallery || []) {
        const src =
          typeof img === "string" ? img : img?.image || "";
        pushImage(entries, seen, pageUrl, src, label);
      }
      for (const img of product.detailImages || []) {
        pushImage(entries, seen, pageUrl, img, label);
      }
    }
  } catch {
    /* CMS optional at build */
  }

  try {
    const gallery = await fetchMergedGallery();
    for (const item of gallery) {
      const pageUrl = `${SITE_ORIGIN}/gallery`;
      const title =
        typeof item.title === "string"
          ? item.title
          : (item.title as { en?: string })?.en || "Gallery";
      pushImage(entries, seen, pageUrl, item.image, title);
    }
  } catch {
    /* CMS optional at build */
  }

  try {
    const blogs = await fetchMergedBlogs();
    for (const blog of blogs) {
      if (!blog.slug) continue;
      const pageUrl = `${SITE_ORIGIN}/guides/${blog.slug}`;
      pushImage(entries, seen, pageUrl, blog.image, blog.title);
      for (const img of blog.gallery || []) {
        pushImage(entries, seen, pageUrl, img, blog.title);
      }
    }
  } catch {
    /* CMS optional at build */
  }

  try {
    const categories = await getIndexableCategories();
    for (const category of categories) {
      if (!category.slug || !category.categoryType) continue;
      const path = categoryPublicPath(category);
      const pageUrl = `${SITE_ORIGIN}${path}`;
      const title =
        typeof category.title === "string"
          ? category.title
          : (category.title as { en?: string })?.en || category.slug;
      pushImage(entries, seen, pageUrl, category.image || "", title);
    }
  } catch {
    /* CMS optional at build */
  }

  const urlBlocks = entries
    .map((entry) => {
      const loc = xmlEscape(entry.pageUrl);
      const img = xmlEscape(entry.imageUrl);
      const title = entry.title ? `<image:title>${xmlEscape(entry.title)}</image:title>` : "";
      return `  <url>
    <loc>${loc}</loc>
    <image:image>
      <image:loc>${img}</image:loc>
      ${title}
    </image:image>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlBlocks}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
