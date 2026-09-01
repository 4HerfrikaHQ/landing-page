"use client";

import { DashboardFilter, SearchInput } from "@/components/dashboard/filter-bar";

const STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];

const CALENDAR_OPTIONS = [
	{ value: "connected", label: "Connected" },
	{ value: "not_connected", label: "Not connected" },
];

export function MentorFilters() {
	return (
		<>
			<SearchInput
				paramKey="q"
				placeholder="Search by name or position…"
				resetPageOnChange
				className="sm:w-80"
			/>
			<DashboardFilter
				label="Status"
				options={STATUS_OPTIONS}
				paramKey="status"
				resetPageOnChange
			/>
			<DashboardFilter
				label="Google Calendar"
				options={CALENDAR_OPTIONS}
				paramKey="calendar"
				resetPageOnChange
			/>
		</>
	);
}
