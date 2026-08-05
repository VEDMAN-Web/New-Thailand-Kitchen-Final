"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "./blogData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { blogCategoryLabel, localizePost } from "./blogI18n";

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

export default function BlogCard({ post: rawPost }: Props) {
  const { t, locale } = useTranslation();
  const post = localizePost(rawPost, locale);
  const href = toBlogHref(post.slug);

  return (
    <article className="group flex flex-col text-left h-full">
      <Link
        href={href}
        className="relative block w-full aspect-[16/11] rounded-[1.5rem] overflow-hidden"
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized={
            post.image.startsWith("/uploads") || post.image.startsWith("http")
          }
        />
      </Link>

      <p className="mt-5 text-[#E0905A] text-xs tracking-[0.22em] uppercase font-semibold">
        {blogCategoryLabel(post.category, t)}
      </p>

      <h3 className="mt-3 text-xl font-extrabold text-[#1A1A1A] leading-snug">
        <Link href={href} className="hover:text-[#E0905A] transition">
          {post.title}
        </Link>
      </h3>

      <p className="mt-3 text-sm text-[#6B6B6B] leading-7 line-clamp-2 flex-1">
        {post.excerpt}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-[#E0905A] text-sm font-semibold tracking-[0.12em] uppercase hover:gap-3 transition-all"
      >
        {t("blog.readArticle")}
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
