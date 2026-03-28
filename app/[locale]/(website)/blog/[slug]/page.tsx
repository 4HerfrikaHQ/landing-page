import type { Metadata } from "next";
import { Calendar, Clock, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { Breadcrumbs } from "../../projects/_components/breadcrumbs";
import { ProjectContent } from "../../projects/_components/project-content";
import { FEATURED_POSTS, type PostSlug, formatPostDate, readTime } from "../_schema";

export function generateStaticParams() {
	return Object.keys(FEATURED_POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = FEATURED_POSTS[slug as PostSlug];
	if (!post) return {};
	return {
		title: post.title,
		description: post.excerpt,
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = FEATURED_POSTS[slug as PostSlug];

	if (!post) notFound();

	const tc = await getTranslations("common");
	const tn = await getTranslations("nav");

	return (
		<main className="bg-background">
			<section className="px-4 pt-6 md:pt-10 pb-20">
				<div className="mx-auto max-w-4xl">
					<Breadcrumbs
						items={[
							{ label: tc("home"), href: "/" },
							{ label: tn("blog"), href: "/blog" },
							{ label: post.title },
						]}
					/>

					<header className="space-y-4 md:space-y-6">
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
							{post.title}
						</h1>

						<div className="relative rounded-2xl overflow-hidden border border-border h-44 sm:h-56 md:h-90 lg:h-110">
							<Image
								src={post.cover}
								alt={post.title}
								fill
								priority
								sizes="(min-width:1280px) 1100px, (min-width:1024px) 900px, 100vw"
								className="object-cover object-top"
							/>
						</div>

						<ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
							<li className="inline-flex items-center gap-2">
								<User className="h-4 w-4" aria-hidden />
								<span>4Herfrika</span>
							</li>
							<li className="inline-flex items-center gap-2">
								<Calendar className="h-4 w-4" aria-hidden />
								<span>{formatPostDate(post.date)}</span>
							</li>
							<li className="inline-flex items-center gap-2">
								<Clock className="h-4 w-4" aria-hidden />
								<span>{readTime(post.content)}</span>
							</li>
						</ul>
					</header>

					<div className="mt-8 md:mt-10 border-t border-border pt-8">
						<ProjectContent>
							<Streamdown mode="static" animated>
								{post.content}
							</Streamdown>
						</ProjectContent>
					</div>
				</div>
			</section>
		</main>
	);
}
