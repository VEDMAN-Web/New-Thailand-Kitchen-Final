"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "./blogData";
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

function toBlogHref(slug: string) {
  const clean = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  return clean ? `/blog/${encodeURIComponent(clean)}` : "/blog";
}

export default function BlogFeaturedCard({ post: rawPost }: Props) {
  const { t, locale } = useTranslation();
  const post = localizePost(rawPost, locale);
  const imageLeft = post.featuredLayout !== "image-right";
  const href = toBlogHref(post.slug);

  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full text-left">
      <Link
        href={href}
        className={`relative w-full aspect-[4/3] rounded-[1.75rem] overflow-hidden block ${
          imageLeft ? "" : "lg:order-2"
        }`}
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 576px"
          unoptimized={
            post.image.startsWith("/uploads") || post.image.startsWith("http")
          }
        />
      </Link>

      <div className={`w-full text-left ${imageLeft ? "" : "lg:order-1"}`}>
        <p className="text-[#E0905A] text-xs tracking-[0.22em] uppercase font-semibold">
          {blogCategoryLabel(post.category, t)}
        </p>

        <h2 className="mt-4 text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-[#1A1A1A] leading-snug">
          <Link href={href} className="hover:text-[#E0905A] transition">
            {post.title}
          </Link>
        </h2>

        <p className="mt-4 text-[#6B6B6B] text-sm sm:text-base leading-7">
          {post.excerpt}
        </p>

        <p className="mt-5 text-xs tracking-[0.14em] uppercase text-[#9A9A9A]">
          {formatBlogDate(post, locale)} · {formatReadTime(post.readTime, t)}
        </p>

        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-[#E0905A] text-sm font-semibold tracking-[0.12em] uppercase hover:gap-3 transition-all"
        >
          {t("blog.readArticle")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
