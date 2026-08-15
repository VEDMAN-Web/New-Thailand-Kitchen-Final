import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogDetailView from "../../../component/blog/BlogDetailView";
import Breadcrumbs from "../../../components/seo/Breadcrumbs";
import JsonLd from "../../../components/seo/JsonLd";
import { blogPosts } from "../../../component/blog/blogData";
import { fetchBlogBySlug } from "../../../services/cmsPublic";
import { pickCmsText } from "../../../lib/cmsText";
import { absoluteUrl, ogImageUrl } from "../../../lib/siteUrl";
import { pickBlogCoverImage } from "../../../lib/cmsMedia";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const normalized = normalizeSlug(decodeURIComponent(slug));
  const post = await fetchBlogBySlug(normalized);

  if (!post) {
    return { title: "Guide Not Found" };
  }

  const title =
    (post as any).metaTitle ||
    `${pickCmsText(post.title, "", "EN")} | Thailand Kitchen Guides`;
  const description =
    (post as any).metaDescription || pickCmsText(post.excerpt, "", "EN");

  const canonical = absoluteUrl(`/guides/${post.slug}`);
  const image = ogImageUrl(pickBlogCoverImage(post));

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: post.dateISO || undefined,
      modifiedTime: post.updatedISO || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const normalized = normalizeSlug(decodeURIComponent(slug));
  const post =
    (await fetchBlogBySlug(normalized)) ||
    blogPosts.find((p) => normalizeSlug(p.slug) === normalized);

  if (!post) notFound();

  const postTitle = pickCmsText(post.title, "", "EN");
  const postExcerpt = pickCmsText(post.excerpt, "", "EN");
  const postContent = Array.isArray(post.content)
    ? post.content.join(" ")
    : "";

  return (
    <main className="w-full">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
        ]}
        currentPage={postTitle}
        currentHref={`/guides/${post.slug}`}
      />
      <JsonLd
        type="Article"
        data={{
          headline: postTitle,
          author: post.author || "Thailand Kitchens",
          datePublished: post.dateISO,
          dateModified: post.updatedISO,
          image: post.image || "",
          articleBody: postExcerpt || postContent,
          reviewer: post.reviewer,
        }}
      />
      <BlogDetailView post={post} />
    </main>
  );
}
