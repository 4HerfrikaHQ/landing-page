export function slugify(text: string) {
	return text
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80)
		.replace(/-+$/g, "");
}

export function createSlugger() {
	const used = new Set<string>();
	return (text: string, fallback: string) => {
		const base = slugify(text) || fallback;
		let slug = base;
		let count = 2;
		while (used.has(slug)) {
			slug = `${base}-${count}`;
			count += 1;
		}
		used.add(slug);
		return slug;
	};
}
