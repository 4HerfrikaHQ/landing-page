import { createClient } from "@/prismicio";

export async function getBlogPost(uid: string) {
	const client = createClient();
	return client.getByUID("blog_post", uid, {
		fetchLinks: ["blog_category.name", "blog_category.uid"],
	});
}
