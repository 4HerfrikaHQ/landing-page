"use client";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import type { MentorSortValue } from "../_schema";

const DEFAULT_DIRECTION: Record<MentorSortValue, "asc" | "desc"> = {
	name: "asc",
	bookings: "desc",
	joined: "desc",
};

export function SortableTableHead({
	value,
	children,
	className,
}: {
	value: MentorSortValue;
	children: ReactNode;
	className?: string;
}) {
	const [query, setQuery] = useQueryStates(
		{
			sort: parseAsString.withDefault("name"),
			order: parseAsString,
			page: parseAsString.withDefault(""),
		},
		{ shallow: false },
	);
	const active = query.sort === value;
	const direction =
		active && (query.order === "asc" || query.order === "desc")
			? query.order
			: DEFAULT_DIRECTION[value];
	const Icon = !active
		? ArrowUpDown
		: direction === "asc"
			? ArrowUp
			: ArrowDown;

	function handleSort() {
		const nextDirection = active
			? direction === "asc"
				? "desc"
				: "asc"
			: DEFAULT_DIRECTION[value];
		void setQuery({ sort: value, order: nextDirection, page: null });
	}

	return (
		<TableHead
			aria-sort={
				active ? (direction === "asc" ? "ascending" : "descending") : "none"
			}
			className={cn("font-medium text-muted-foreground", className)}
		>
			<button
				type="button"
				onClick={handleSort}
				aria-label={`Sort by ${String(children)}`}
				className={cn(
					"group inline-flex items-center gap-1.5 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
					active && "text-foreground",
				)}
			>
				{children}
				<Icon
					className={cn(
						"size-3.5 transition-opacity",
						active ? "opacity-100" : "opacity-35 group-hover:opacity-70",
					)}
					aria-hidden
				/>
			</button>
		</TableHead>
	);
}
