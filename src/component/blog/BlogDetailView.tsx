"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPost, getRelatedPosts } from "./blogData";
import BlogCard from "./BlogCard";
import BlogConsultationCta from "./BlogConsultationCta";
import { useTranslation } from "../../i18n/LanguageProvider";
import {
  blogCategoryLabel,
  formatBlogDate,
  formatReadTime,
  localizePost,
} from "./blogI18n";
import {
  fetchHomeSections,
  fetchMergedBlogs,
} from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import CmsResolvedImage from "../CmsResolvedImage";

interface Props {
  post: BlogPost;
}

const defaultShareLinks = [
  {
    icon: "/footer/facebook.png",
    label: "Facebook",
    href: "https://www.facebook.com/ThailandKitchens/",
  },
  { icon: "/footer/instagram.png", label: "Instagram", href: "#" },
  { icon: "/footer/x.png", label: "X", href: "#" },
  { icon: "/footer/whatsapp.png", label: "WhatsApp", href: "#" },
];

const shareIconByLabel: Record<string, string> = {
  facebook: "/footer/facebook.png",
  instagram: "/footer/instagram.png",
  x: "/footer/x.png",
  twitter: "/footer/x.png",
  whatsapp: "/footer/whatsapp.png",
};

export default function BlogDetailView({ post: rawPost }: Props) {
  const { t, locale } = useTranslation();
  const post = localizePost(rawPost, locale);
  const [related, setRelated] = useState<BlogPost[]>(() =>
    getRelatedPosts(post.slug, 2)
  );
  const [shareLinks, setShareLinks] = useState(defaultShareLinks);
  const [relatedTitle, setRelatedTitle] = useState(t("blog.detail.related"));
  const gallery = post.gallery ?? [post.image, post.image];

  useEffect(() => {
    let alive = true;
    Promise.all([fetchMergedBlogs(), fetchHomeSections()]).then(
      ([blogs, sections]) => {
        if (!alive) return;
        const blogPage = (sections?.blogPage || {}) as {
          relatedTitle?: unknown;
          shareLinks?: { label?: unknown; href?: string }[];
        };
        setRelatedTitle(
          pickCmsText(blogPage.relatedTitle, t("blog.detail.related"), locale)
        );
        const cmsShares = (blogPage.shareLinks || [])
          .map((l) => {
            const label = pickCmsText(l?.label, "", locale);
            const key = label.toLowerCase();
            return {
              label,
              href: l.href || "#",
              icon: shareIconByLabel[key] || "/footer/facebook.png",
            };
          })
          .filter((l) => l.label);
        if (cmsShares.length) setShareLinks(cmsShares);

        const pool = blogs.length ? blogs : [];
        const others = pool.filter((b) => b.slug !== post.slug);
        const sameCategory = others.filter(
          (b) => b.category === post.category
        );
        const picked = (sameCategory.length ? sameCategory : others).slice(
          0,
          2
        );
        if (picked.length) setRelated(picked);
      }
    );
    return () => {
      alive = false;
    };
  }, [post.slug, post.category, t, locale]);

  const [intro, ...remaining] = post.content;
  const afterQuote = remaining.slice(1);
  const beforeQuote = remaining[0];
  const structuredSections = (post.bodySections || []).filter(
    (s) => s.title || s.content || s.image
  );
  const useStructured = structuredSections.length > 0;

  return (
    <div className="w-full bg-[#F5F3EF]">
      <article className="pt-[80px] sm:pt-[84px] pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-left">
              <p className="text-sm text-[#8A8A8A] mb-5">
                <Link href="/guides" className="hover:text-[#1A1A1A] transition">
                  {`< ${t("blog.detail.breadcrumb")}`}
                </Link>
                <span className="mx-2">/</span>
                <span>{blogCategoryLabel(post.category, t)}</span>
              </p>

              <p className="text-[#E0905A] text-xs tracking-[0.22em] uppercase font-semibold mb-3">
                {blogCategoryLabel(post.category, t)}
              </p>

              <p className="text-xs tracking-[0.14em] uppercase text-[#9A9A9A] mb-5">
                {formatBlogDate(post, locale)} · {formatReadTime(post.readTime, t)}
                {post.author ? ` · ${post.author}` : ""}
                {post.reviewer ? ` · Reviewed by ${post.reviewer}` : ""}
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] leading-tight">
                {post.title}
              </h1>

              <p className="mt-5 text-[#6B6B6B] text-base leading-8">
                {post.excerpt}
              </p>

              {(post.primaryCommercialPage ||
                post.locationTag ||
                post.serviceTag ||
                post.materialTag) && (
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  {post.primaryCommercialPage ? (
                    <Link
                      href={post.primaryCommercialPage}
                      className="inline-flex items-center rounded-full border border-[#1A2332] px-4 py-1.5 font-semibold text-[#1A2332] hover:bg-[#1A2332] hover:text-white transition"
                    >
                      Related page
                    </Link>
                  ) : null}
                  {[post.locationTag, post.serviceTag, post.materialTag]
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-[#E8E4DC] px-3 py-1 text-xs uppercase tracking-wide text-[#5C6370]"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="relative mt-10 lg:mt-12 w-full h-[240px] sm:h-[340px] md:h-[420px] rounded-[1.75rem] overflow-hidden">
              <CmsResolvedImage
                src={post.image}
                alt={post.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>

            <div className="mt-12 lg:mt-16 flex items-start gap-8 lg:gap-10">
              <aside className="hidden lg:flex flex-col gap-3 shrink-0 pt-1">
                {shareLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="w-10 h-10 rounded-full bg-[#EDE8E1] flex items-center justify-center hover:bg-[#E0905A]/25 transition"
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={16}
                      height={16}
                      className="[filter:brightness(0)_saturate(100%)_invert(67%)_sepia(48%)_saturate(498%)_hue-rotate(338deg)_brightness(99%)_contrast(90%)]"
                    />
                  </Link>
                ))}
              </aside>

              <div className="min-w-0 flex-1 text-left">
                {useStructured ? (
                  <div className="space-y-10">
                    {structuredSections.map((section, index) => (
                      <section key={`${section.title}-${index}`}>
                        {section.title ? (
                          <h2 className="text-2xl sm:text-[1.75rem] font-extrabold text-[#1A1A1A]">
                            {section.title}
                          </h2>
                        ) : null}
                        {section.content ? (
                          <div className="mt-4 space-y-4">
                            {section.content
                              .split(/\n{2,}/)
                              .map((p) => p.trim())
                              .filter(Boolean)
                              .map((paragraph, pIndex) => (
                                <p
                                  key={pIndex}
                                  className="text-[#4A4A4A] text-[15px] sm:text-base leading-8 whitespace-pre-line"
                                >
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        ) : null}
                        {section.image ? (
                          <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-[1.5rem]">
                            <CmsResolvedImage
                              src={section.image}
                              alt={section.title || post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 896px) 100vw, 720px"
                            />
                          </div>
                        ) : null}
                      </section>
                    ))}
                  </div>
                ) : (
                  <>
                    {intro ? (
                      <p className="text-[#4A4A4A] text-[15px] sm:text-base leading-8">
                        {intro}
                      </p>
                    ) : null}

                    {post.subsectionTitle ? (
                      <h2 className="mt-10 text-2xl sm:text-[1.75rem] font-extrabold text-[#1A1A1A]">
                        {post.subsectionTitle}
                      </h2>
                    ) : null}

                    {post.highlightText ? (
                      <p className="mt-5 text-[#4A4A4A] text-[15px] sm:text-base leading-8">
                        {post.highlightText}
                      </p>
                    ) : null}

                    {beforeQuote ? (
                      <p className="mt-5 text-[#4A4A4A] text-[15px] sm:text-base leading-8">
                        {beforeQuote}
                      </p>
                    ) : null}
                  </>
                )}

                {useStructured && post.subsectionTitle ? (
                  <h2 className="mt-10 text-2xl sm:text-[1.75rem] font-extrabold text-[#1A1A1A]">
                    {post.subsectionTitle}
                  </h2>
                ) : null}
                {useStructured && post.highlightText ? (
                  <p className="mt-5 text-[#4A4A4A] text-[15px] sm:text-base leading-8">
                    {post.highlightText}
                  </p>
                ) : null}

                {post.quote ? (
                  <blockquote className="mt-10 border-l-[3px] border-[#E0905A] pl-6 py-1">
                    <p className="text-lg sm:text-xl italic text-[#1A1A1A] leading-8">
                      &ldquo;{post.quote}&rdquo;
                    </p>
                    {post.quoteAuthor ? (
                      <cite className="mt-4 block not-italic text-xs tracking-[0.18em] uppercase text-[#8A8A8A]">
                        — {post.quoteAuthor}
                      </cite>
                    ) : null}
                  </blockquote>
                ) : null}

                {!useStructured
                  ? afterQuote.map((paragraph, index) => (
                      <p
                        key={index}
                        className="mt-5 text-[#4A4A4A] text-[15px] sm:text-base leading-8"
                      >
                        {paragraph}
                      </p>
                    ))
                  : null}

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {gallery.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden"
                    >
                      <Image
                        src={src}
                        alt={`${post.title} gallery ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 420px"
                        unoptimized={
                          src.startsWith("http") || src.startsWith("/uploads")
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <BlogConsultationCta />

          <div className="mt-20 lg:mt-28 max-w-4xl mx-auto">
            <p className="text-[#E0905A] text-xs tracking-[0.22em] uppercase font-semibold mb-3">
              {t("blog.detail.continue")}
            </p>

            <div className="flex items-end justify-between gap-6 mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
                {relatedTitle}
              </h2>
              <Link
                href="/guides"
                className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#E0905A] transition"
              >
                {t("blog.detail.viewAll")}
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
