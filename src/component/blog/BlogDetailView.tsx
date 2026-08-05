"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogPost, getRelatedPosts } from "./blogData";
import BlogCard from "./BlogCard";
import Footer from "../Footer/footer";
import { useTranslation } from "../../i18n/LanguageProvider";
import {
  blogCategoryLabel,
  formatBlogDate,
  formatReadTime,
  localizePost,
} from "./blogI18n";

interface Props {
  post: BlogPost;
}

const shareLinks = [
  { icon: "/footer/facebook.png", label: "Facebook", href: "https://www.facebook.com/ThailandKitchens/" },
  { icon: "/footer/instagram.png", label: "Instagram", href: "#" },
  { icon: "/footer/x.png", label: "X", href: "#" },
  { icon: "/footer/whatsapp.png", label: "WhatsApp", href: "#" },
];

export default function BlogDetailView({ post: rawPost }: Props) {
  const { t, locale } = useTranslation();
  const post = localizePost(rawPost, locale);
  const related = getRelatedPosts(post.slug, 2);
  const gallery = post.gallery ?? [post.image, post.image];

  const [intro, ...remaining] = post.content;
  const afterQuote = remaining.slice(1);
  const beforeQuote = remaining[0];

  return (
    <div className="w-full bg-[#F5F3EF]">
      <article className="pt-[80px] sm:pt-[84px] pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Centered article column */}
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-left">
              <p className="text-sm text-[#8A8A8A] mb-5">
                <Link href="/blog" className="hover:text-[#1A1A1A] transition">
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
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#1A1A1A] leading-tight">
                {post.title}
              </h1>

              <p className="mt-5 text-[#6B6B6B] text-base leading-8">
                {post.excerpt}
              </p>
            </div>

            {/* Featured image */}
            <div className="relative mt-10 lg:mt-12 w-full h-[240px] sm:h-[340px] md:h-[420px] rounded-[1.75rem] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>

            {/* Body + share rail */}
            <div className="mt-12 lg:mt-16 flex items-start gap-8 lg:gap-10">
              <aside className="hidden lg:flex flex-col gap-3 shrink-0 pt-1">
                {shareLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
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

                {beforeQuote ? (
                  <p className="mt-5 text-[#4A4A4A] text-[15px] sm:text-base leading-8">
                    {beforeQuote}
                  </p>
                ) : null}

                {post.quote ? (
                  <blockquote className="mt-10 border-l-[3px] border-[#E0905A] pl-6 py-1">
                    <p className="text-lg sm:text-xl italic text-[#1A1A1A] leading-8 font-serif">
                      &ldquo;{post.quote}&rdquo;
                    </p>
                    {post.quoteAuthor ? (
                      <cite className="mt-4 block not-italic text-xs tracking-[0.18em] uppercase text-[#8A8A8A]">
                        — {post.quoteAuthor}
                      </cite>
                    ) : null}
                  </blockquote>
                ) : null}

                {afterQuote.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mt-5 text-[#4A4A4A] text-[15px] sm:text-base leading-8"
                  >
                    {paragraph}
                  </p>
                ))}

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
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related journal — same centered width as article */}
          <div className="mt-20 lg:mt-28 max-w-4xl mx-auto">
            <p className="text-[#E0905A] text-xs tracking-[0.22em] uppercase font-semibold mb-3">
              {t("blog.detail.continue")}
            </p>

            <div className="flex items-end justify-between gap-6 mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
                {t("blog.detail.related")}
              </h2>
              <Link
                href="/blog"
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

      <Footer />
    </div>
  );
}
