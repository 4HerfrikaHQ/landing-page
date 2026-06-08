import type { Metadata } from "next";
import { Calendar, Clock, Share2, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { Breadcrumbs } from "../../projects/_components/breadcrumbs";
import { MakeADifference } from "@/components/make-a-difference";
import { RelatedStoriesCard } from "@/components/related-stories-card";
import { components } from "@/slices";
import { getBlogPosts } from "../_actions";
import { computeReadTime, formatPrismicDate } from "../_utils";
import { getBlogPost, getRelatedPosts, formatPrismicDateShort } from "./_actions";

export const revalidate = 86400;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.uid }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    return {
      title: post.data.title ?? "",
      description: post.data.description ?? "",
    };
  } catch {
    return {};
  }
}
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getBlogPost(slug);
  } catch {
    notFound();
  }

  const category = post.data.category as { id?: string; data?: { name?: string } };
  const related = await getRelatedPosts(post.id, category?.id ?? null, 4);

  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const shareTitle = post.data.title ?? "";

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${postUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
  };

  return (
    <main className="bg-background">
      <section className="px-4 pt-6 md:pt-10 pb-20">
        <div className="mx-auto max-w-[1144px] flex flex-col gap-8">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-3">
              <Breadcrumbs
                items={[
                  { label: tc("home"), href: "/" },
                  { label: tn("blog"), href: "/blog" },
                  { label: post.data.title ?? "" },
                ]}
              />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-bold md:leading-[75px] text-foreground pb-3 mb-8 border-b border-[#E5E7EB]">
                {post.data.title}
              </h1>
              <ul className="flex flex-wrap items-center gap-6 text-[#555555]">
                <li className="flex items-center gap-2">
                  <User className="size-5 shrink-0" aria-hidden />
                  <span className="text-base font-medium">
                    {post.data.author || "4Herfrika"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="size-5 shrink-0" aria-hidden />
                  <span className="text-base">{formatPrismicDate(post)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-5 shrink-0" aria-hidden />
                  <span className="text-base">{computeReadTime(post)}</span>
                </li>
              </ul>
            </div>

            {post.data.cover_image?.url && (
              <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-[500px]">
                <Image
                  src={post.data.cover_image.url}
                  alt={post.data.cover_image.alt ?? post.data.title ?? ""}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width:1280px) 1144px, (min-width:1024px) 900px, 100vw"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-12">
            <SliceZone slices={post.data.slices} components={components} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-b border-[#E5E7EB] py-8">
              <span className="flex items-center gap-3 text-lg font-semibold text-[#1E2939]">
                <Share2 className="size-5 shrink-0" aria-hidden />
                Share this story
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-[#00C950] px-6 py-3 text-base font-medium text-[#00C950] no-underline hover:no-underline! transition-colors hover:bg-[#00C950]/5"
                >
                  <Image src="/assets/whatsapp-icon.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
                  WhatsApp
                </a>
                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-black px-6 py-3 text-base text-black no-underline hover:no-underline! transition-colors hover:bg-black/5"
                >
                  <Image src="/assets/x-icon.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                  Twitter
                </a>
                <a
                  href={shareUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-[#155DFC] px-6 py-3 text-base font-medium text-[#155DFC] no-underline hover:no-underline! transition-colors hover:bg-[#155DFC]/5"
                >
                  <Image src="/assets/linkedin-icon.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                  LinkedIn
                </a>
              </div>
            </div>

            {related.length > 0 && (
              <section className="flex flex-col gap-8">
                <h2 className="text-[30px] font-bold leading-9 text-black">
                  Related Stories
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-2">
                  {related.map((rp) => {
                    const rCat = rp.data.category as {
                      data?: { name?: string };
                    };
                    return (
                      <RelatedStoriesCard
                        key={rp.id}
                        uid={rp.uid ?? ""}
                        category={rCat?.data?.name ?? ""}
                        title={rp.data.title ?? ""}
                        date={formatPrismicDateShort(rp)}
                        readTime={computeReadTime(rp)}
                        imageUrl={rp.data.cover_image?.url ?? ""}
                        imageAlt={
                          rp.data.cover_image?.alt ?? rp.data.title ?? ""
                        }
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      <MakeADifference />
    </main>
  );
}
