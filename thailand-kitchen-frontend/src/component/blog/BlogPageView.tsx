import BlogHero from "./BlogHero";
import BlogListSection from "./BlogListSection";
import Footer from "../Footer/footer";
import type { BlogPost } from "./blogData";

export default function BlogPageView({
  initialPosts,
}: {
  initialPosts: BlogPost[];
}) {
  return (
    <div className="w-full bg-[#F5F3EF]">
      <BlogHero />
      <div className="max-w-6xl mx-auto px-6">
        <BlogListSection initialPosts={initialPosts} />
      </div>
      <Footer />
    </div>
  );
}
