import { notFound } from "next/navigation";
import BlogDetailView from "../../../component/blog/BlogDetailView";
import { blogPosts } from "../../../component/blog/blogData";
import { fetchBlogBySlug } from "../../../services/cmsPublic";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeSlug(slug: string) {
  return String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const normalized = normalizeSlug(decodeURIComponent(slug));
  const post = await fetchBlogBySlug(normalized);

  if (!post) {
    const fromStatic = blogPosts.find(
      (p) => normalizeSlug(p.slug) === normalized
    );
    if (!fromStatic) notFound();
    return (
      <main className="w-full">
        <BlogDetailView post={fromStatic} />
      </main>
    );
  }

  return (
    <main className="w-full">
      <BlogDetailView post={post} />
    </main>
  );
}
