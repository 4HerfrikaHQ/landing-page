"use server";

import * as prismic from "@prismicio/client";
import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";
import {
	USE_STUBS,
	stubGetCampus,
	stubGetCampusCountries,
	stubGetCampuses,
	stubGetCampusesTotal,
	stubSearchCampuses,
} from "./_stubs";

export async function getCampuses() {
	if (USE_STUBS) return stubGetCampuses();
	const client = createClient();
	return client.getAllByType<Content.CampusDocument>("campus", {
		orderings: [{ field: "document.last_publication_date", direction: "desc" }],
	});
}

export async function getCampus(uid: string) {
	if (USE_STUBS) {
		const doc = stubGetCampus(uid);
		if (!doc) throw new Error("Campus not found");
		return doc;
	}
	const client = createClient();
	return client.getByUID<Content.CampusDocument>("campus", uid);
}

export async function searchCampuses({
	page,
	pageSize,
	query,
	country,
}: {
	page: number;
	pageSize: number;
	query?: string;
	country?: string;
}): Promise<Content.CampusDocument[]> {
	if (USE_STUBS) return stubSearchCampuses({ page, pageSize, query, country });
	const client = createClient();
	const filters: string[] = [];
	const trimmed = query?.trim();
	if (trimmed) filters.push(prismic.filter.fulltext("document", trimmed));
	if (country) filters.push(prismic.filter.at("my.campus.country", country));

	const res = await client.getByType<Content.CampusDocument>("campus", {
		filters,
		orderings: [{ field: "document.last_publication_date", direction: "desc" }],
		page: page + 1,
		pageSize,
	});
	return res.results;
}

export async function getCampusCountries(): Promise<string[]> {
	if (USE_STUBS) return stubGetCampusCountries();
	const client = createClient();
	const all = await client
		.getAllByType<Content.CampusDocument>("campus")
		.catch(() => []);
	const set = new Set(
		all.map((c) => c.data.country).filter((v): v is string => Boolean(v)),
	);
	return Array.from(set).sort();
}

export async function getCampusesTotal(): Promise<number> {
	if (USE_STUBS) return stubGetCampusesTotal();
	const client = createClient();
	const res = await client.getByType<Content.CampusDocument>("campus", {
		pageSize: 1,
	});
	return res.total_results_size;
}
