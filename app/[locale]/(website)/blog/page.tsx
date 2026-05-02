import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FeaturedStory } from "@/components/featured-story";
import { BlogSection } from "./_components/blog-section";
import { SubmitStoryModal } from "./_components/submit-story-modal";
import { getBlogPosts, getCategories } from "./_actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "The Pink Blog — Stories of Women Leading Change in Africa",
	description:
		"Read inspiring stories, experiences, and insights from women across Africa navigating tech, business, and leadership. A safe space to find your mojo.",
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);

	const [posts, categories] = await Promise.all([getBlogPosts(), getCategories()]);
	const featured = posts[0];

	return (
		<>
			<section
				className="-mt-16 lg:-mt-[90px] pt-16 lg:pt-[90px] flex flex-col items-center justify-center text-center px-4 min-h-[580px]"
				style={{
					background: "linear-gradient(180deg, rgba(236,0,140,0.18) 0%, rgba(236,0,140,0.08) 45%, rgba(255,255,255,1) 85%)",
				}}
			>
				<div className="max-w-3xl mx-auto flex flex-col items-center gap-6 mt-16">
					<h1 className="text-5xl lg:text-[64px] font-bold leading-[1.1] text-foreground">
						Stories, Insights &amp; Perspectives
					</h1>
					<p className="text-lg lg:text-2xl text-foreground/60 max-w-2xl">
						Exploring the realities, challenges, and opportunities shaping women and girls
						across Africa — through stories, opinions, and lived experiences.
					</p>
					<Link
						href="#blog-grid"
						className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-full px-8 py-4 text-lg font-medium hover:!no-underline hover:brightness-90 transition-all"
					>
						Read Latest Stories
						<ArrowRight className="size-5" />
					</Link>
				</div>
			</section>

			{featured && (
				<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-18">
					<FeaturedStory
						uid={featured.uid ?? ""}
						title={featured.data.title ?? ""}
						description={featured.data.description ?? ""}
						imageUrl={featured.data.cover_image?.url ?? ""}
					/>
				</section>
			)}

			<BlogSection posts={posts} categories={categories} />

			<section className="my-16 h-[600px] relative overflow-hidden rounded-[40px] bg-[#F24DAF] px-8 lg:px-24 py-20">
				<div className="absolute top-0 -translate-y-[50%] left-9 size-[470px] rounded-full border-[100px] border-[#F13EA8]" />
				<div className="absolute top-0 -translate-y-[50%] right-[400px] size-[262px] rounded-full border-[60px] border-[#F13EA8]" />
				<div className="absolute bottom-0 left-64 translate-y-[50%] size-[270px] h-[262px] rounded-full border-[60px] border-[#F13EA8]" />
				<div className="absolute bottom-0 right-12 size-[480px] translate-y-[50%] rounded-full border-[100px] border-[#F13EA8]" />

        <div className="relative z-10 flex flex-col justify-center items-center text-center max-w-[733px] mx-auto h-full">
         	<h2 className="text-[56px] font-bold leading-[1.4] text-white mb-6">
							Stay Connected
					</h2>
					<p className="text-lg text-white mb-20">
						Get stories, opportunities, and insights delivered directly to you.
					</p>
					<form className="flex w-full gap-4">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 h-14 rounded-full bg-white px-6 text-base outline-none text-foreground placeholder:text-[#979797]"
						/>
						<Button
							className="bg-[#EC008C] gap-2"
						>
							Subscribe
							<ArrowRight className="size-5" />
						</Button>
					</form>
				</div>
			</section>

			<section className="pt-12 pb-20 px-4 text-center">
				<div className="max-w-2xl mx-auto flex flex-col items-center">
					<h2 className="text-4xl lg:text-[48px] font-semibold text-[#333333] pb-9">
						Have a Story to Share?
					</h2>
					<p className="text-xl lg:text-2xl text-[#333333]/80 leading-relaxed pb-14">
						We welcome voices from across Africa. Share your experience, insights, or
						perspective with our community.
					</p>
					<SubmitStoryModal categories={categories} />
				</div>
			</section>
		</>
	);
}
