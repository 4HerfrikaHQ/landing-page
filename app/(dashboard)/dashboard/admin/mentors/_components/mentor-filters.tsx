"use client";

import { FilterSelect, SearchInput } from "@/components/dashboard/filter-bar";
import { parseAsString, useQueryStates } from "nuqs";

const STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

const CALENDAR_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "connected", label: "Connected" },
	{ value: "not_connected", label: "Not connected" },
];

export function MentorFilters() {
	const [filters, setFilters] = useQueryStates(
		{
			status: parseAsString.withDefault("all"),
			calendar: parseAsString.withDefault("all"),
			page: parseAsString.withDefault(""),
		},
		{ shallow: false },
	);

	function updateFilter(key: "status" | "calendar", value: string | null) {
		void setFilters({ [key]: value === "all" ? null : value, page: null });
	}

	return (
		<>
			<SearchInput
				paramKey="q"
				placeholder="Search by name or position…"
				resetPageOnChange
				className="sm:w-80"
			/>
			<FilterSelect
				label="Status"
				value={filters.status}
				options={STATUS_OPTIONS}
				onValueChange={(value) => updateFilter("status", value)}
			/>
			<FilterSelect
				label="Google Calendar"
				value={filters.calendar}
				options={CALENDAR_OPTIONS}
				onValueChange={(value) => updateFilter("calendar", value)}
			/>
		</>
	);
}
