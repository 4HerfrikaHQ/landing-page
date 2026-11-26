import { describe, expect, test } from "bun:test";
import { articleJsonLd } from "./_article";
import {
	type FeedItem,
	absoluteUrl,
	chipTone,
	feedCategories,
	filterFeed,
	findCategory,
	mergeFeed,
	projectExcerpt,
	readingMinutes,
	relatedItems,
	shareLinks,
	splitTitle,
} from "./_feed";

function item(overrides: Partial<FeedItem>): FeedItem {
	return {
		kind: "post",
		slug: "a",
		href: "/blog/a",
		title: "A",
		excerpt: "",
		date: "2026-01-01",
		minutes: 1,
		categorySlug: "stories",
		categoryName: "Stories",
		imageSrc: "",
		imageAlt: "",
		imageFit: "cover",
		...overrides,
	};
}

describe("mergeFeed", () => {
	test("interleaves posts and projects newest first", () => {
		const posts = [
			item({ slug: "p1", date: "2026-08-01T18:06:11+0000" }),
			item({ slug: "p2", date: "2025-02-01" }),
		];
		const projects = [
			item({ slug: "j1", kind: "project", date: "2026-02-01" }),
		];
		expect(mergeFeed(posts, projects).map((entry) => entry.slug)).toEqual([
			"p1",
			"j1",
			"p2",
		]);
	});

	test("puts items with an unreadable date last", () => {
		const merged = mergeFeed([
			item({ slug: "bad", date: "" }),
			item({ slug: "ok", date: "2024-01-01" }),
		]);
		expect(merged.map((entry) => entry.slug)).toEqual(["ok", "bad"]);
	});
});

describe("filterFeed", () => {
	const items = [
		item({ slug: "a", categorySlug: "stories" }),
		item({ slug: "b", categorySlug: "projects", kind: "project" }),
	];

	test("returns everything without a category", () => {
		expect(filterFeed(items, null)).toHaveLength(2);
	});

	test("keeps only the matching category", () => {
		expect(filterFeed(items, "projects").map((entry) => entry.slug)).toEqual([
			"b",
		]);
	});
});

describe("feedCategories", () => {
	test("lists projects first, then only blog categories that have items", () => {
		const items = [item({ categorySlug: "leadership" })];
		const chips = feedCategories(
			items,
			[
				{ slug: "stories", name: "Stories" },
				{ slug: "leadership", name: "Leadership" },
			],
			"Projects",
		);
		expect(chips.map((chip) => chip.slug)).toEqual(["projects", "leadership"]);
	});

	test("ignores a blog category that collides with projects", () => {
		const chips = feedCategories(
			[item({ categorySlug: "projects" })],
			[{ slug: "projects", name: "Blog projects" }],
			"Projects",
		);
		expect(chips).toEqual([{ slug: "projects", name: "Projects" }]);
	});
});

describe("findCategory", () => {
	test("finds a known empty blog category and rejects unknown slugs", () => {
		const blog = [{ slug: "leadership", name: "Leadership" }];
		expect(findCategory("leadership", [], blog)?.name).toBe("Leadership");
		expect(findCategory("nope", [], blog)).toBeNull();
	});
});

describe("readingMinutes", () => {
	test("is at least one minute", () => {
		expect(readingMinutes("")).toBe(1);
		expect(readingMinutes("a few words")).toBe(1);
	});

	test("rounds at 200 words per minute", () => {
		expect(readingMinutes("word ".repeat(450))).toBe(2);
		expect(readingMinutes("word ".repeat(1000))).toBe(5);
	});
});

describe("chipTone", () => {
	test("maps known categories and is stable for others", () => {
		expect(chipTone("projects")).toBe("navy");
		expect(chipTone("stories")).toBe("pink");
		expect(chipTone("leadership")).toBe(chipTone("leadership"));
		expect(chipTone("leadership")).not.toBe("navy");
	});
});

describe("projectExcerpt", () => {
	test("uses the first paragraph without markdown", () => {
		expect(
			projectExcerpt(
				'Themed **"EmpowerHER"** boot camp.\n\n![img](https://x/y.jpg)\n\n## Next',
			),
		).toBe('Themed "EmpowerHER" boot camp.');
	});

	test("truncates long paragraphs on a word boundary", () => {
		const excerpt = projectExcerpt("word ".repeat(100));
		expect(excerpt.endsWith("…")).toBe(true);
		expect(excerpt.length).toBeLessThanOrEqual(151);
	});
});

describe("splitTitle", () => {
	test("accents the part after the first colon", () => {
		expect(splitTitle("Pad-A-Girl: Nasarawa State Initiative")).toEqual({
			lead: "Pad-A-Girl:",
			accent: "Nasarawa State Initiative",
		});
	});

	test("leaves a title without a colon alone", () => {
		expect(splitTitle("Sisterhood")).toEqual({
			lead: "Sisterhood",
			accent: "",
		});
	});
});

describe("relatedItems", () => {
	const items = [
		item({ slug: "a", href: "/blog/a", categorySlug: "stories" }),
		item({ slug: "b", href: "/blog/b", categorySlug: "stories" }),
		item({ slug: "c", href: "/projects/c", categorySlug: "projects" }),
	];

	test("keeps the same category and drops the current item", () => {
		expect(
			relatedItems(items, { href: "/blog/a", categorySlug: "stories" }).map(
				(entry) => entry.slug,
			),
		).toEqual(["b"]);
	});

	test("respects the limit", () => {
		expect(
			relatedItems(items, { href: "/x", categorySlug: "stories" }, 1),
		).toHaveLength(1);
	});
});

describe("shareLinks", () => {
	test("encodes the url and title", () => {
		const links = shareLinks("https://4herfrika.org/blog/a?x=1", "Hello & hi");
		expect(links.x).toBe(
			"https://x.com/intent/post?text=Hello%20%26%20hi&url=https%3A%2F%2F4herfrika.org%2Fblog%2Fa%3Fx%3D1",
		);
		expect(links.linkedin).toContain("url=https%3A%2F%2F4herfrika.org");
		expect(links.whatsapp).toContain("wa.me/?text=Hello%20%26%20hi%20https");
	});
});

describe("absoluteUrl", () => {
	test("adds the locale prefix except for English", () => {
		expect(absoluteUrl("https://4herfrika.org/", "en", "/blog/a")).toBe(
			"https://4herfrika.org/blog/a",
		);
		expect(absoluteUrl("https://4herfrika.org", "fr", "/blog/a")).toBe(
			"https://4herfrika.org/fr/blog/a",
		);
	});
});

describe("articleJsonLd", () => {
	test("escapes angle brackets and falls back to the organisation author", () => {
		const json = articleJsonLd({
			title: "</script>",
			description: "",
			image: "",
			date: "2026-01-01",
			author: "",
			url: "https://4herfrika.org/blog/a",
		});
		expect(json).not.toContain("<");
		const parsed = JSON.parse(json);
		expect(parsed.headline).toBe("</script>");
		expect(parsed.author["@type"]).toBe("Organization");
		expect(parsed.description).toBeUndefined();
	});
});
