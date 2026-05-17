"use server";

import * as prismic from "@prismicio/client";
import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

export async function getCampuses() {
	const client = createClient();
	return client.getAllByType<Content.CampusDocument>("campus", {
		orderings: [{ field: "document.last_publication_date", direction: "desc" }],
	});
}

export async function getCampus(uid: string) {
	const client = createClient();
	return client.getByUID<Content.CampusDocument>("campus", uid);
}

export async function searchCampuses({
	page,
	pageSize,
	query,
}: {
	page: number;
	pageSize: number;
	query?: string;
}): Promise<Content.CampusDocument[]> {
	const client = createClient();
	const filters: string[] = [];
	const trimmed = query?.trim();
	if (trimmed) filters.push(prismic.filter.fulltext("document", trimmed));

	const res = await client.getByType<Content.CampusDocument>("campus", {
		filters,
		orderings: [{ field: "document.last_publication_date", direction: "desc" }],
		page: page + 1,
		pageSize,
	});
	return res.results;
}

export async function getCampusesTotal(): Promise<number> {
	const client = createClient();
	const res = await client.getByType<Content.CampusDocument>("campus", {
		pageSize: 1,
	});
	return res.total_results_size;
}
