import { redirect } from "next/navigation";
import { blogPosts } from "../../component/blog/blogData";
import { fetchMergedBlogs } from "../../services/cmsPublic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Legacy /blog — permanent redirect also in next.config; this is a safety net. */
export default async function BlogPage() {
  await fetchMergedBlogs().catch(() => blogPosts);
  redirect("/guides");
}
