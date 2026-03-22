import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

export async function getAboutPage() {
	const client = createClient();
	return client.getSingle<Content.AboutPageDocument>("about_page");
}
