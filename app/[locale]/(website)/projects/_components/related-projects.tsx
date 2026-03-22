"use client";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	type ProjectSlug,
	projects,
	readTime,
	relatedProjects,
} from "../_schema";

type RelatedItem = (typeof relatedProjects)[number];

export function RelatedProjects({
	title = "More Projects to Explore",
	items,
}: {
	title?: string;
	items: readonly RelatedItem[];
}) {
	return (
		<section className="mt-16 md:mt-24">
			{/* Section header */}
			<div className="mb-6 md:mb-8 flex items-center gap-4">
				<span className="h-px w-16 sm:w-24 bg-accent" />
				<h2 className="text-sm tracking-[0.18em] font-semibold text-foreground uppercase">
					{title}
				</h2>
			</div>

			{/* Cards */}
			<div className="grid gap-5 sm:gap-6 lg:gap-7 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => {
					const project = projects[item.slug];
					const href = `/projects/${item.slug}` as Route;
					return (
						<Link
							key={item.slug}
							href={href}
							className="group relative block rounded-2xl overflow-hidden border border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60"
							aria-label={`Read more: ${project.title}`}
						>
							<div className="relative h-56 sm:h-64 lg:h-72">
								<Image
									src={project.cover}
									alt={project.title}
									fill
									sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
									className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
									priority={false}
								/>
								<div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/25" />
							</div>

							{/* Overlay panel */}
							<div className="absolute inset-x-4 bottom-4">
								<div className="rounded-xl bg-gray-900/90 text-white shadow-lg backdrop-blur-sm p-4 sm:p-5">
									<h3 className="text-lg font-semibold leading-snug">
										{project.title}
									</h3>
									<p className="mt-1 text-sm text-white/85 line-clamp-2">
										{item.excerpt}
									</p>

									<div className="mt-3 flex items-center gap-4 text-xs text-white/80">
										<span>{readTime(project.content)}</span>
										<span className="ml-auto inline-flex items-center gap-1 font-semibold underline-offset-4 group-hover:underline">
											Read More
											<ArrowUpRight
												className="h-3.5 w-3.5 -mr-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
												aria-hidden="true"
											/>
										</span>
									</div>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
