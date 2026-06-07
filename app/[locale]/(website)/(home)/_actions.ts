import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";

export async function getHomepage() {
	const client = createClient();
	return client.getSingle<Content.HomepageDocument>("homepage");
}
