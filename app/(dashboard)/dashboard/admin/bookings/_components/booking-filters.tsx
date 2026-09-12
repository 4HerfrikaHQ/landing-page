"use client";

import { DashboardFilter, SearchInput } from "@/components/dashboard/filter-bar";
import { BookingStatus } from "@/src/db/schema/tables/bookings";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import type { MentorOption } from "../_actions";

const STATUS_LABELS: Record<BookingStatus, string> = {
	confirmed: "Confirmed",
	completed: "Completed",
	cancelled: "Cancelled",
	no_show: "No show",
};

const STATUS_OPTIONS = [
	...BookingStatus.options.map((value) => ({
		value,
		label: STATUS_LABELS[value],
	})),
];

const DATE_OPTIONS = [
	{ value: "upcoming", label: "Upcoming" },
	{ value: "past", label: "Past" },
	{ value: "30d", label: "Last 30 days" },
	{ value: "custom", label: "Custom" },
];

export function BookingFilters({ mentors }: { mentors: MentorOption[] }) {
	const [filters, setFilters] = useQueryStates(
		{
			q: parseAsString.withDefault(""),
			status: parseAsString.withDefault("all"),
			mentor: parseAsString.withDefault("all"),
			date: parseAsString.withDefault("all"),
			from: parseAsString.withDefault(""),
			to: parseAsString.withDefault(""),
			page: parseAsString.withDefault(""),
		},
		{ shallow: false },
	);

	const hasFilters =
		Boolean(filters.q) ||
		filters.status !== "all" ||
		filters.mentor !== "all" ||
		filters.date !== "all" ||
		Boolean(filters.from || filters.to);

	return (
		<>
			<SearchInput
				paramKey="q"
				placeholder="Search mentee name or email…"
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
				label="Mentor"
				options={mentors.map((mentor) => ({
					value: mentor.slug,
					label: mentor.name,
				}))}
				paramKey="mentor"
				resetPageOnChange
				className="sm:max-w-56"
			/>
			<DashboardFilter
				label="Date"
				options={DATE_OPTIONS}
				paramKey="date"
				allLabel="All time"
				resetPageOnChange
				onValueChange={(value) => {
					if (value !== "custom") {
						void setFilters({ from: null, to: null });
					}
				}}
			/>

			{filters.date === "custom" ? (
				<div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
					<DateInput
						label="From date"
						value={filters.from}
						onChange={(from) =>
							void setFilters({ from: from || null, page: null })
						}
					/>
					<span className="text-muted-foreground">–</span>
					<DateInput
						label="To date"
						value={filters.to}
						onChange={(to) => void setFilters({ to: to || null, page: null })}
					/>
				</div>
			) : null}

			{hasFilters ? (
				<button
					type="button"
					onClick={() =>
						void setFilters({
							q: null,
							status: null,
							mentor: null,
							date: null,
							from: null,
							to: null,
							page: null,
						})
					}
					className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-500"
				>
					<X className="size-3.5" />
					Clear
				</button>
			) : null}
		</>
	);
}

function DateInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<input
			type="date"
			aria-label={label}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className={cn(
				"h-10 rounded-full border border-[#E0E0E0] bg-white px-3 text-sm text-foreground outline-none transition-colors",
				"hover:border-primary-500 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
			)}
		/>
	);
}
