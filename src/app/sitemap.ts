import { MetadataRoute } from "next";
import {
  getIndexableCategories,
  getIndexableProducts,
  fetchMergedBlogs,
} from "../services/cmsPublic";
import { categoryPublicPath } from "../lib/categoryRoutes";
import { SITE_ORIGIN } from "../lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  const staticPaths = [
    "",
    "/products",
    "/kitchens",
    "/kitchens/layouts",
    "/kitchens/styles",
    "/kitchens/by-property",
    "/built-in-furniture",
    "/services",
    "/materials",
    "/locations",
    "/guides",
    "/gallery",
    "/catalogue",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ];

  // DEV-10 redirected location×service URLs must not appear in the sitemap
  const excludedPaths = new Set([
    "/locations/bangkok/kitchen-renovation",
    "/locations/bangkok/kitchen-design",
    "/locations/phuket/kitchen-renovation",
    "/locations/koh-samui/kitchen-design",
  ]);

  for (const path of staticPaths) {
    sitemap.push({
      url: `${SITE_ORIGIN}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "/guides" ? "daily" : "weekly",
      priority:
        path === ""
          ? 1
          : path === "/products" || path === "/kitchens"
            ? 0.9
            : 0.7,
    });
  }

  try {
    const categories = await getIndexableCategories();
    for (const category of categories) {
      if (
        category.slug &&
        category.categoryType &&
        category.indexable === true
      ) {
        const path = categoryPublicPath(category);
        if (excludedPaths.has(path)) continue;
        sitemap.push({
          url: `${SITE_ORIGIN}${path}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("[SITEMAP] Error fetching indexable categories:", error);
  }

  try {
    const products = await getIndexableProducts();
    for (const product of products) {
      if (product.slug) {
        sitemap.push({
          url: `${SITE_ORIGIN}/products/${product.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("[SITEMAP] Error fetching indexable products:", error);
  }

  try {
    const blogs = await fetchMergedBlogs();
    for (const blog of blogs) {
      // Only published guides with a primary commercial page belong in the sitemap
      if (
        blog.slug &&
        (blog as { published?: boolean }).published !== false &&
        blog.primaryCommercialPage
      ) {
        sitemap.push({
          url: `${SITE_ORIGIN}/guides/${blog.slug}`,
          lastModified: blog.dateISO ? new Date(blog.dateISO) : new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("[SITEMAP] Error fetching published blogs:", error);
  }

  return sitemap;
}
