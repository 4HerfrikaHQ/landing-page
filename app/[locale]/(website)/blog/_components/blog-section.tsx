"use client";

import { BlogCard } from "@/components/blog-card";
import { cn } from "@/utils/cn";
import { useQueryState } from "nuqs";
import type { Content } from "@prismicio/client";
import { computeReadTime, formatPrismicDate } from "../_utils";

type Props = {
  posts: Content.BlogPostDocument[];
  categories: Content.BlogCategoryDocument[];
  featuredUid?: string;
};

export function BlogSection({ posts, categories, featuredUid }: Props) {
  const [activeCategory, setActiveCategory] = useQueryState("category", {
    defaultValue: "all",
  });

  const gridPosts = featuredUid ? posts.filter((p) => p.uid !== featuredUid) : posts;

  const usedCategoryUids = new Set(
    gridPosts.map((post) => (post.data.category as { uid?: string })?.uid).filter(Boolean)
  );

  const visibleCategories = categories.filter((cat) => usedCategoryUids.has(cat.uid));

  const filtered = activeCategory === "all"
    ? gridPosts
    : gridPosts.filter((post) => {
      const cat = post.data.category as { uid?: string };
      return cat?.uid === activeCategory;
    });

  const getClassName = (category: string) => {
    const isActive = activeCategory === category

    return cn(
      "rounded-full h-9 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors duration-200 cursor-pointer",
      {
        "bg-primary-500 text-white": isActive,
        "bg-white border border-[#E0E0E0] text-[#636363] hover:border-primary-500 hover:text-primary-500": !isActive
      }
    )
  }

  return (
    <section id="blog-grid" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-18 lg:pb-18 scroll-m-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={getClassName("all")}
        >
          All
        </button>
        {visibleCategories.map((cat) => (
          <button
            key={cat.uid}
            type="button"
            onClick={() => setActiveCategory(cat.uid ?? "all")}
            className={getClassName(cat.uid)}
          >
            {cat.data.name}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {filtered.map((post) => {
            const category = post.data.category as { data?: { name?: string }; uid?: string };
            return (
              <BlogCard
                key={post.uid}
                uid={post.uid ?? ""}
                title={post.data.title ?? ""}
                description={post.data.description ?? ""}
                category={category?.data?.name ?? ""}
                date={formatPrismicDate(post)}
                readTime={computeReadTime(post)}
                imageUrl={post.data.cover_image?.url ?? ""}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] mt-10">
          <p className="text-xl text-muted-foreground">No posts in this category yet</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon</p>
        </div>
      )}
    </section>
  );
}
