import { generateOGImage, size, contentType } from "../../_lib/og";
import { FEATURED_POSTS, type PostSlug } from "../_schema";

export { size, contentType };

export function generateStaticParams() {
	return Object.keys(FEATURED_POSTS).map((slug) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = FEATURED_POSTS[slug as PostSlug];

	return generateOGImage(
		post?.title ?? "Blog Post",
		post?.excerpt,
	);
}
