import type { Content } from "@prismicio/client";
import * as prismic from "@prismicio/client";
import { Resend } from "resend";
import { createClient, repositoryName } from "@/prismicio";

export async function getBlogPosts() {
	const client = createClient();
	return client.getAllByType("blog_post", {
		fetchLinks: ["blog_category.name", "blog_category.uid"],
		orderings: [{ field: "document.first_publication_date", direction: "desc" }],
	});
}

export async function getCategories() {
	const client = createClient();
	return client.getAllByType("blog_category");
}

export function computeReadTime(post: Content.BlogPostDocument): string {
	const text = post.data.slices
		.flatMap((slice) => {
			if (slice.slice_type === "blog_content" && slice.variation === "default") {
				return (slice.primary.text as Array<{ text: string }>).map((n) => n.text);
			}
			return [];
		})
		.join(" ");
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function formatPrismicDate(post: Content.BlogPostDocument): string {
	const date = post.first_publication_date;
	if (!date) return "";
	return new Date(date).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

async function uploadToPrismicAsset(file: File): Promise<string> {
	const assetFormData = new FormData();
	assetFormData.append("file", file);

	const res = await fetch("https://asset-api.prismic.io/assets", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.PRISMIC_WRITE_TOKEN!}`,
			repository: repositoryName,
		},
		body: assetFormData,
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Asset upload failed: ${res.status} ${body}`);
	}

	const asset = await res.json();
	return asset.id as string;
}

export type SubmitStoryState = { success: true } | { error: string } | null;

export async function submitStory(
	_prevState: SubmitStoryState,
	formData: FormData,
): Promise<SubmitStoryState> {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const description = formData.get("description") as string;
	const title = formData.get("title") as string;
	const categoryId = formData.get("categoryId") as string;
	const story = formData.get("story") as string;
	const imageFile = formData.get("image") as File | null;

	if (!name || !email || !description || !title || !categoryId || !story) {
		return { error: "Please fill in all required fields." };
	}

	let imageId: string | null = null;

	if (imageFile && imageFile.size > 0) {
		try {
			imageId = await uploadToPrismicAsset(imageFile);
		} catch (err) {
			console.error("[submit-story] Asset upload failed:", err);
			return { error: "Failed to upload image. Please try again." };
		}
	}

	try {
		const writeClient = prismic.createWriteClient(repositoryName, {
			writeToken: process.env.PRISMIC_WRITE_TOKEN!,
		});

		const migration = prismic.createMigration();

		const uid = `${slugify(title)}-${Date.now()}`;

		const paragraphs = story
			.split(/\n{2,}/)
			.map((p) => p.replace(/\n/g, " ").trim())
			.filter(Boolean)
			.map((text) => ({ type: "paragraph" as const, text, spans: [] }));

		const docData = {
			type: "blog_post" as const,
			uid,
			lang: "en-us",
			data: {
				title,
				description,
				author: name,
				// Migration API only needs `{ id }` — library reuses read types which expect full ImageField shape
				cover_image: (imageId ? { id: imageId } : {}) as any,
				// Migration API takes a simple link object — library reuses read types which expect FilledContentRelationshipField
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				category: { link_type: "Document", id: categoryId } as any,
				submitted_story: true,
				slices: [
					{
						slice_type: "blog_content",
						variation: "default",
						primary: { text: paragraphs },
						items: [],
					},
				],
			},
		};

		console.log("[submit-story] Creating Prismic document:", JSON.stringify(docData, null, 2));

		migration.createDocument(docData, `Submitted: ${title}`);
		let documentId: string | null = null;

		await writeClient.migrate(migration, {
			reporter: (event) => {
				if (event.type === "documents:updating") {
					documentId = (event.data as any)?.document?.document?.id ?? null;
				}
			},
    });

		const resend = new Resend(process.env.RESEND_API_KEY);

		await resend.emails.send({
			from: "4HerFrika <noreply@4herfrika.org>",
			to: "4herfrika@gmail.com",
			subject: `New Story Submission: ${title}`,
			html: `
				<h2>New story submitted on 4HerFrika</h2>
				<p><strong>Name:</strong> ${name}</p>
				<p><strong>Email:</strong> ${email}</p>
				<p><strong>Title:</strong> ${title}</p>
				<p><strong>Description:</strong> ${description}</p>
				<p><strong>Story preview:</strong></p>
				<blockquote style="border-left:3px solid #ec008c;padding-left:12px;color:#555">
					${story.slice(0, 500)}${story.length > 500 ? "…" : ""}
				</blockquote>
				<p>${
					documentId
						? `<a href="https://4herfrika-admin.prismic.io/builder/pages/${documentId}">Open draft in Prismic</a>`
						: ""
				}</p>
			`,
		});

		return { success: true };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("[submit-story] Error:", message);
		if (err instanceof Error && "response" in (err as any)) {
			const apiErr = err as any;
			console.error("[submit-story] API response:", JSON.stringify(apiErr.response, null, 2));
		}
		console.error("[submit-story] Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
		return { error: "Something went wrong. Please try again." };
	}
}
