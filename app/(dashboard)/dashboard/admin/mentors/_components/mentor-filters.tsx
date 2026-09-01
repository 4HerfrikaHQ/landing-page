"use client";

import { SearchInput } from "@/components/dashboard/filter-bar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

function FilterSelect({
	label,
	value,
	options,
	onValueChange,
}: {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onValueChange: (value: string | null) => void;
}) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger
				aria-label={label}
				className="h-10 w-full rounded-full border-[#E0E0E0] bg-white px-4 sm:w-auto sm:min-w-40"
			>
				<span className="text-muted-foreground">{label}:</span>
				<SelectValue>
					{(selectedValue) =>
						options.find((option) => option.value === selectedValue)?.label ??
						options[0].label
					}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
