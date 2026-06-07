import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";

export async function getAboutPage() {
	const client = createClient();
	return client.getSingle<Content.AboutPageDocument>("about_page");
}
