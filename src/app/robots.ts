import { MetadataRoute } from "next";
import { SITE_ORIGIN } from "../lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cms-api/", "/admin/"],
      },
      {
        // ChatGPT / OpenAI search crawler — LLM-friendly visibility
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/api/", "/cms-api/", "/admin/"],
      },
    ],
    sitemap: [`${SITE_ORIGIN}/sitemap.xml`, `${SITE_ORIGIN}/sitemap-images.xml`],
  };
}
