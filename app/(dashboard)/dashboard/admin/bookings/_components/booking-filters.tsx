"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BookingStatus } from "@/src/db/schema/tables/bookings";
import { cn } from "@/utils/cn";
import { Search, X } from "lucide-react";
import { debounce, parseAsString, useQueryStates } from "nuqs";
import type { MentorOption } from "../_actions";

const ALL = "all";
const ALL_MENTORS = "__all__";

const STATUS_LABELS: Record<BookingStatus, string> = {
	confirmed: "Confirmed",
	completed: "Completed",
	cancelled: "Cancelled",
	no_show: "No show",
};

const STATUS_OPTIONS = BookingStatus.options.map((value) => ({
	value,
	label: STATUS_LABELS[value],
}));

export function BookingFilters({ mentors }: { mentors: MentorOption[] }) {
	// All filters in one nuqs store (shallow:false → server refetch). nuqs is
	// optimistic, so inputs stay responsive and only the search write is debounced.
	const [filters, setFilters] = useQueryStates(
		{
			status: parseAsString.withDefault("all"),
			q: parseAsString.withDefault(""),
			mentor: parseAsString.withDefault(""),
			from: parseAsString.withDefault(""),
			to: parseAsString.withDefault(""),
			page: parseAsString.withDefault(""),
		},
		// Re-run the server query (which reads these params) on every change.
		{ shallow: false },
	);

	const { status, q, mentor, from, to } = filters;

	function update(
		patch: Partial<Record<keyof typeof filters, string | null>>,
		options?: Parameters<typeof setFilters>[1],
	) {
		// Any filter change drops back to page 1.
		setFilters({ ...patch, page: null }, options);
	}

	function handleSearch(next: string) {
		update({ q: next || null }, { limitUrlUpdates: debounce(300) });
	}

	const pillClass = (isActive: boolean) =>
		cn(
			"inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
			isActive
				? "bg-primary-500 text-white"
				: "border border-[#E0E0E0] bg-white text-[#636363] hover:border-primary-500 hover:text-primary-500",
		);

	const hasFilters = status !== ALL || Boolean(q || mentor || from || to);

	function clearAll() {
		setFilters({
			status: null,
			q: null,
			mentor: null,
			from: null,
			to: null,
			page: null,
		});
	}

	return (
		<>
			<div className="relative w-full sm:w-64">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="search"
					value={q}
					placeholder="Search mentee name or email…"
					onChange={(e) => handleSearch(e.target.value)}
					className="h-10 w-full rounded-full border border-[#E0E0E0] bg-white pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-primary-500 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={() => update({ status: null })}
					className={pillClass(status === ALL)}
				>
					All
				</button>
				{STATUS_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => update({ status: option.value })}
						className={pillClass(status === option.value)}
					>
						{option.label}
					</button>
				))}
			</div>

			<Select
				value={mentor || ALL_MENTORS}
				onValueChange={(value) =>
					update({ mentor: value === ALL_MENTORS ? null : value })
				}
			>
				<SelectTrigger className="h-10 w-full rounded-full border-[#E0E0E0] sm:w-56">
					<SelectValue placeholder="All mentors" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_MENTORS}>All mentors</SelectItem>
					{mentors.map((mentorOption) => (
						<SelectItem key={mentorOption.id} value={mentorOption.id}>
							{mentorOption.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="flex items-center gap-2">
				<DateInput
					label="From date"
					value={from}
					onChange={(v) => update({ from: v || null })}
				/>
				<span className="text-muted-foreground">–</span>
				<DateInput
					label="To date"
					value={to}
					onChange={(v) => update({ to: v || null })}
				/>
			</div>

			{hasFilters ? (
				<button
					type="button"
					onClick={clearAll}
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
			onChange={(e) => onChange(e.target.value)}
			className={cn(
				"h-10 rounded-full border border-[#E0E0E0] bg-white px-3 text-sm text-foreground outline-none transition-colors",
				"hover:border-primary-500 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
			)}
		/>
	);
}
