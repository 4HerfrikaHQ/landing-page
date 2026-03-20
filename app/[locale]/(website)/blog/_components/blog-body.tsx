"use client";

import { StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
	FEATURED_POSTS,
	POST_CATEGORIES,
	type PostSlug,
	formatPostDate,
	readTime,
} from "../_schema";

function PostCard({
	slug,
	post,
}: { slug: string; post: (typeof FEATURED_POSTS)[PostSlug] }) {
	return (
		<Link
			href={`/blog/${slug}` as Route}
			className="flex flex-col bg-muted rounded-md hover:shadow-lg transition-shadow duration-200 hover:no-underline group"
		>
			<div className="relative w-full h-55">
				<Image
					src={post.cover}
					fill
					alt={post.title}
					className="rounded-t-md object-cover"
				/>
			</div>
			<div className="px-3 py-4 flex flex-col gap-3">
				<h2 className="text-base font-semibold text-foreground group-hover:text-primary-500 transition-colors">
					{post.title}
				</h2>
				<p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
				<div className="flex justify-between items-center text-sm text-foreground">
					<span>
						{formatPostDate(post.date)} &middot; {readTime(post.content)}
					</span>
					<span className="text-primary-500 font-medium">Read More</span>
				</div>
			</div>
		</Link>
	);
}

function EmptyState({ category }: { category: string }) {
	return (
		<div className="col-span-full flex flex-col items-center justify-center min-h-[430px]">
			<p className="text-xl text-muted-foreground">No posts found for {category}</p>
			<p className="text-sm text-foreground">
				Please check back later for updates
			</p>
		</div>
	);
}

export default function BlogBody() {
	const [category, setCategory] = useQueryState("category", {
		defaultValue: "Featured",
	});

	const allPosts = Object.entries(FEATURED_POSTS);

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
			<Tabs value={category} onValueChange={(value) => setCategory(value)}>
				<div className="w-full overflow-x-auto">
					<TabsList variant="line" className="h-auto gap-2">
						{POST_CATEGORIES.map((item) => (
							<TabsTrigger
								key={`category-${item}`}
								value={item}
								className="shrink-0 whitespace-nowrap px-3 py-2 text-base"
							>
								{item}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				{POST_CATEGORIES.map((cat) => {
					const catPosts = allPosts.filter(([, post]) => post.category === cat);
					return (
						<TabsContent key={`panel-${cat}`} value={cat}>
							<StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
								{catPosts.length > 0 ? (
									catPosts.map(([slug, post]) => (
										<StaggerItem key={slug}>
											<HoverCard className="h-full rounded-md">
												<PostCard slug={slug} post={post} />
											</HoverCard>
										</StaggerItem>
									))
								) : (
									<EmptyState category={cat} />
								)}
							</StaggerContainer>
						</TabsContent>
					);
				})}
			</Tabs>
		</section>
	);
}
