"use client";

import { useEffect, useRef, useState } from "react";
import BlogFilters from "./BlogFilters";
import BlogFeaturedCard from "./BlogFeaturedCard";
import BlogCard from "./BlogCard";
import { BlogCategory, type BlogPost } from "./blogData";
import { useTranslation } from "../../i18n/LanguageProvider";
import { fetchMergedBlogs } from "../../services/cmsPublic";

// Only re-fetch in background if data is older than 30 seconds
// This prevents hammering the remote backend on every client navigation
const STALE_AFTER_MS = 30_000;
let cachedPosts: BlogPost[] | null = null;
let cacheTimestamp = 0;

export default function BlogListSection({
  initialPosts,
}: {
  initialPosts: BlogPost[];
}) {
  const { t } = useTranslation();
  const [active, setActive] = useState<BlogCategory>("All");

  // Hydrate from module-level cache if fresh, otherwise use SSR data
  const startPosts =
    cachedPosts && Date.now() - cacheTimestamp < STALE_AFTER_MS
      ? cachedPosts
      : initialPosts;

  const [posts, setPosts] = useState<BlogPost[]>(startPosts);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip if cache is still fresh
    if (cachedPosts && Date.now() - cacheTimestamp < STALE_AFTER_MS) return;
    // Skip if already fetching in this component instance
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchMergedBlogs()
      .then((fresh) => {
        if (fresh.length > 0) {
          cachedPosts = fresh;
          cacheTimestamp = Date.now();
          setPosts(fresh);
        }
      })
      .catch(() => {});
  }, []);

  const filtered =
    active === "All"
      ? posts
      : posts.filter(
          (post) =>
            post.filter === active ||
            post.category.toLowerCase() === active.toLowerCase()
        );

  const featured = filtered.filter((post) => post.featured);
  const gridPosts = filtered.filter((post) => !post.featured);

  return (
    <section className="pb-16 lg:pb-24 bg-[#F5F3EF] pt-10 lg:pt-12">
      <BlogFilters active={active} onChange={setActive} />

      <div className="mt-12 lg:mt-16 space-y-16 lg:space-y-20 w-full">
        {featured.map((post) => (
          <BlogFeaturedCard key={post.id} post={post} />
        ))}
      </div>

      {gridPosts.length > 0 ? (
        <div className="mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
          {gridPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-left text-[#6B6B6B]">{t("blog.empty")}</p>
      )}
    </section>
  );
}
