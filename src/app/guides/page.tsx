import type { Metadata } from "next";
import BlogPageView from "../../component/blog/BlogPageView";
import { blogPosts } from "../../component/blog/blogData";
import { fetchMergedBlogs } from "../../services/cmsPublic";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GUIDES_TITLE = "Kitchen Design Guides & Inspiration | Thailand Kitchens";
const GUIDES_DESCRIPTION =
  "Explore our curated collection of kitchen design guides, craftsmanship stories, and tropical living inspiration from the Thailand Kitchens journal.";
const GUIDES_URL = `${SITE_ORIGIN}/guides`;

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: GUIDES_TITLE,
  description: GUIDES_DESCRIPTION,
  alternates: await seoAlternates("/guides"),
  openGraph: {
    type: "website",
    title: GUIDES_TITLE,
    description: GUIDES_DESCRIPTION,
    url: GUIDES_URL,
  },
  };
}

export default async function GuidesPage() {
  const posts = await fetchMergedBlogs().catch(() => blogPosts);
  return <BlogPageView initialPosts={posts} />;
}
