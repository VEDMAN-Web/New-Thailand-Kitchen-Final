import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
import BlogPageView from "../../component/blog/BlogPageView";
import { blogPosts } from "../../component/blog/blogData";
import { fetchMergedBlogs } from "../../services/cmsPublic";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GUIDES_TITLE = "Kitchen Blog Thailand: Kitchen Ideas & Layout Guides";
const GUIDES_DESCRIPTION =
  "Read expert articles on kitchen layouts, design ideas, and practical tips for choosing the right kitchen products for your home in Thailand.";
const GUIDES_URL = `${SITE_ORIGIN}/guides`;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await localizedStatic("/guides", GUIDES_TITLE, GUIDES_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/guides"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: GUIDES_URL,
  },
  };
}

export default async function GuidesPage() {
  const posts = await fetchMergedBlogs().catch(() => blogPosts);
  return <BlogPageView initialPosts={posts} />;
}
