export function articleJsonLd(input: {
	title: string;
	description: string;
	image: string;
	date: string;
	author: string;
	url: string;
}) {
	const data = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: input.title,
		description: input.description || undefined,
		image: input.image || undefined,
		datePublished: input.date || undefined,
		author: input.author
			? { "@type": "Person", name: input.author }
			: { "@type": "Organization", name: "4HerFrika" },
		publisher: { "@type": "Organization", name: "4HerFrika" },
		mainEntityOfPage: input.url,
	};
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
