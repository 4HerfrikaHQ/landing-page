import { FeaturedStory } from "@/components/featured-story";
import { Button } from "@/components/ui/button";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getBlogPosts, getCategories } from "./_actions";
import { BlogSection } from "./_components/blog-section";

const circle = (size: "big" | "small", extra: string) => {
	const base = "absolute rounded-full border-[#F13EA8]";
	const variant =
		size === "big"
			? "size-50 border-50 sm:border-[100px]"
			: "size-35 border-[30px] sm:border-[60px]";
	return `${base} ${variant} ${extra}`;
};

export const metadata: Metadata = {
	title: "The Pink Blog — Stories of Women Leading Change in Africa",
	description:
		"Read inspiring stories, experiences, and insights from women across Africa navigating tech, business, and leadership. A safe space to find your mojo.",
};

export default async function BlogPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);

	const [posts, categories] = await Promise.all([
		getBlogPosts(),
		getCategories(),
	]);
	const featured = posts[0];

	return (
		<>
			<section
				className="-mt-16 lg:-mt-[90px] pt-16 lg:pt-[90px] flex flex-col items-center justify-center text-center px-4 min-h-[580px]"
				style={{
					background:
						"linear-gradient(180deg, rgba(236,0,140,0.18) 0%, rgba(236,0,140,0.08) 45%, rgba(255,255,255,1) 85%)",
				}}
			>
				<div className="max-w-3xl mx-auto flex flex-col items-center gap-6 mt-16">
					<h1 className="text-5xl lg:text-[64px] font-bold leading-[1.1] text-foreground">
						Stories, Insights &amp; Perspectives
					</h1>
					<p className="text-lg lg:text-2xl text-foreground/60 max-w-2xl">
						Exploring the realities, challenges, and opportunities shaping women
						and girls across Africa — through stories, opinions, and lived
						experiences.
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

			<Suspense><BlogSection posts={posts} categories={categories} featuredUid={featured?.uid} /></Suspense>

			<section className="my-16 h-[420px] sm:h-[600px] relative overflow-hidden rounded-[40px] bg-[#F24DAF] px-6 sm:px-8 lg:px-24 py-12 sm:py-20">
				<div
					className={circle(
						"big",
						"top-0 -translate-y-[50%] left-1 sm:left-9 sm:size-[470px]",
					)}
				/>
				<div
					className={circle(
						"small",
						"top-0 -translate-y-[50%] right-4 sm:right-50 sm:size-[262px]",
					)}
				/>
				<div
					className={circle(
						"small",
						"bottom-0 left-4 sm:left-64 translate-y-[50%] sm:size-[270px] h-[140px] sm:h-[262px]",
					)}
				/>
				<div
					className={circle(
						"big",
						"bottom-0 right-4 sm:right-12 translate-y-[50%] sm:size-120",
					)}
				/>

				<div className="relative z-10 flex flex-col justify-center items-center text-center max-w-[733px] mx-auto h-full">
					<h2 className="text-[32px] sm:text-[56px] font-bold leading-[1.4] text-white mb-4 sm:mb-6">
						Stay Connected
					</h2>
					<p className="text-base sm:text-lg text-white mb-10 sm:mb-20">
						Get stories, opportunities, and insights delivered directly to you.
					</p>
					<form className="flex flex-col sm:flex-row w-full max-w-[420px] sm:max-w-none gap-3 sm:gap-4">
						<input
							type="email"
							placeholder="Enter your email"
							className="sm:flex-1 shrink-0 h-14 rounded-full bg-white px-6 text-base outline-none text-foreground placeholder:text-[#979797]"
						/>
						<Button className="bg-[#EC008C] gap-2 w-full sm:w-auto">
							Subscribe
							<ArrowRight className="size-5" />
						</Button>
					</form>
				</div>
			</section>
		</>
	);
}
