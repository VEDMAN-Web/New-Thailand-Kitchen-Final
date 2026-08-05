import BlogPageView from "../../component/blog/BlogPageView";
import { blogPosts } from "../../component/blog/blogData";
import { fetchMergedBlogs } from "../../services/cmsPublic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage() {
  const posts = await fetchMergedBlogs().catch(() => blogPosts);
  return <BlogPageView initialPosts={posts} />;
}
