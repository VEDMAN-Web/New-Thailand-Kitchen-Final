import type { Metadata } from "next";
import BlogPageView from "../../component/blog/BlogPageView";
import { blogPosts } from "../../component/blog/blogData";
import { fetchMergedBlogs } from "../../services/cmsPublic";
import { pageSeo } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo({
    title: "Kitchen Guides | Thailand Kitchens",
    description:
      "Kitchen design guides covering teak, layouts, worktops, and everyday Thai kitchen living.",
    path: "/guides",
  });
}

export default async function GuidesPage() {
  const posts = await fetchMergedBlogs().catch(() => blogPosts);
  return <BlogPageView initialPosts={posts} />;
}
