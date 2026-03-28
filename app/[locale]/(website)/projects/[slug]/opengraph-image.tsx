import { generateOGImage, size, contentType } from "../../_lib/og";
import { type ProjectSlug, projects } from "../_schema";

export { size, contentType };

export function generateStaticParams() {
	return Object.keys(projects).map((slug) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const project = projects[slug as ProjectSlug];

	return generateOGImage(project?.title ?? "Project");
}
