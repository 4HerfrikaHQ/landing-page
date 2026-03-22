import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

export async function getHomepage() {
	const client = createClient();
	return client.getSingle<Content.HomepageDocument>("homepage");
}
