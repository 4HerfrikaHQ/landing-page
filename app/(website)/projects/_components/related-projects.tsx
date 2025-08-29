"use client";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

export type RelatedProject = {
	title: string;
	excerpt: string;
	href: string;
	image: string;
	date?: string | Date;
	readTime?: string;
};

function formatDate(d?: string | Date) {
	if (!d) return null;
	if (typeof d === "string") return d;
	try {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
		}).format(d);
	} catch {
		return String(d);
	}
}

export function RelatedProjects({
	title = "More Projects to Explore",
	projects,
}: {
	title?: string;
	projects: RelatedProject[];
}) {
	return (
		<section className="mt-16 md:mt-24">
			{/* Section header */}
			<div className="mb-6 md:mb-8 flex items-center gap-4">
				<span className="h-px w-16 sm:w-24 bg-gray-300/70" />
				<h2 className="text-sm tracking-[0.18em] font-semibold text-gray-700 uppercase">
					{title}
				</h2>
			</div>

			{/* Cards */}
			<div className="grid gap-5 sm:gap-6 lg:gap-7 sm:grid-cols-2 lg:grid-cols-3">
				{projects.map((p) => {
					const date = formatDate(p.date);
					return (
						<Link
							key={p.href}
							href={p.href as Route}
							className="group relative block rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60"
							aria-label={`Read more: ${p.title}`}
						>
							<div className="relative h-56 sm:h-64 lg:h-72">
								<Image
									src={p.image}
									alt={p.title}
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
										{p.title}
									</h3>
									<p className="mt-1 text-sm text-white/85 line-clamp-2">
										{p.excerpt}
									</p>

									<div className="mt-3 flex items-center gap-4 text-xs text-white/80">
										{date && <span>{date}</span>}
										{p.readTime && (
											<span className="before:content-['•'] before:mx-2 before:text-white/50">
												{p.readTime}
											</span>
										)}
										<span className="ml-auto inline-flex items-center gap-1 font-semibold underline-offset-4 group-hover:underline">
											Read More
											<svg
												className="h-3.5 w-3.5 -mr-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d="M7 17L17 7" />
												<path d="M8 7h9v9" />
											</svg>
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
