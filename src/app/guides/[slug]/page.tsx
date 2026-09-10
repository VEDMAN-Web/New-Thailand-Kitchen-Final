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
import { getServerLocale } from "../../../lib/serverLocale";
import { tx } from "../../../i18n/translations";

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

  const locale = await getServerLocale();
  const title =
    (post as any).metaTitle ||
    `${pickCmsText(post.title, "", locale)} | Thailand Kitchen Guides`;
  const description =
    (post as any).metaDescription || pickCmsText(post.excerpt, "", locale);

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

  const locale = await getServerLocale();
  const postTitle = pickCmsText(post.title, "", locale);
  const postExcerpt = pickCmsText(post.excerpt, "", locale);
  const postContent = Array.isArray(post.content)
    ? post.content.join(" ")
    : "";

  return (
    <main className="w-full">
      <Breadcrumbs
        items={[
          { label: tx(locale, "nav.home"), href: "/" },
          { label: tx(locale, "nav.guides"), href: "/guides" },
        ]}
        currentPage={postTitle}
        currentHref={`/guides/${post.slug}`}
        locale={locale}
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
