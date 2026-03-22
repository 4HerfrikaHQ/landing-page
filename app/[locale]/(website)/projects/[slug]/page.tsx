import type { Metadata } from "next";
import { Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { ProjectContent } from "../_components/project-content";
import { RelatedProjects } from "../_components/related-projects";
import {
	type ProjectSlug,
	formatProjectDate,
	projects,
	readTime,
	relatedProjects,
} from "../_schema";

export function generateStaticParams() {
	return Object.keys(projects).map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const project = projects[slug as ProjectSlug];
	if (!project) return {};
	return {
		title: project.title,
		description: project.content.slice(0, 160).replace(/\n/g, " ").trim(),
	};
}

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const project = projects[slug as ProjectSlug];

	if (!project) notFound();

	return (
		<main className="bg-background">
			<section className="px-4 pt-6 md:pt-10 pb-36">
				<div className="mx-auto max-w-4xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Projects", href: "/projects" },
							{ label: project.title },
						]}
					/>

					{/* Hero */}
					<header className="space-y-4 md:space-y-6">
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
							{project.title}
						</h1>

						<div className="relative rounded-2xl overflow-hidden border border-border h-44 sm:h-56 md:h-90 lg:h-110 xl:h-125">
							<Image
								src={project.cover}
								alt={project.title}
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
								<span>{formatProjectDate(project.date)}</span>
							</li>
							<li className="inline-flex items-center gap-2">
								<Clock className="h-4 w-4" aria-hidden />
								<span>{readTime(project.content)}</span>
							</li>
						</ul>
					</header>
					<div className="mt-8 md:mt-10 border-t border-border pt-8">
						<ProjectContent>
							<Streamdown mode="static" animated>
								{project.content}
							</Streamdown>
						</ProjectContent>
					</div>
				</div>
				<div className="max-w-9xl mx-auto w-full">
					<RelatedProjects items={relatedProjects} />
				</div>
			</section>
		</main>
	);
}
