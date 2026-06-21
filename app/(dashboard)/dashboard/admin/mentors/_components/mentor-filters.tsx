"use client";

import { FilterPills, SearchInput } from "@/components/dashboard/filter-bar";

const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

const SORT_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "joined", label: "Joined" },
	{ value: "bookings", label: "Bookings" },
];

const FEATURED_OPTIONS = [
	{ value: "featured", label: "Featured" },
	{ value: "not_featured", label: "Not featured" },
];

/**
 * Mentor list filters: search + status + sort + featured pills.
 * All controls write `nuqs` query params (`q`, `status`, `sort`, `featured`)
 * read by the server query in `page.tsx` / `_actions.ts`.
 */
export function MentorFilters() {
	return (
		<>
			<SearchInput paramKey="q" placeholder="Search by name or position…" />
			<FilterPills label="Status" paramKey="status" options={STATUS_OPTIONS} />
			<FilterPills
				label="Sort"
				paramKey="sort"
				options={SORT_OPTIONS}
				defaultValue="name"
				includeAll={false}
			/>
			<FilterPills
				label="Featured"
				paramKey="featured"
				options={FEATURED_OPTIONS}
			/>
		</>
	);
}
