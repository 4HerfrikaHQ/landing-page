"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { SearchInput } from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import { HoverCard, StaggerContainer, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/utils/cn";
import { SearchX } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useTransition } from "react";
import { MENTOR_PAGE_SIZE } from "../_utils/mentor-search";
import { MentorCard } from "./mentor-modal";

export function MentorDirectory({
	mentors,
	total,
	page,
	searchPlaceholder,
	availableLabel,
}: {
	mentors: DbMentorWithAvailability[];
	total: number;
	page: number;
	searchPlaceholder: string;
	availableLabel: string;
}) {
	const [isPending, startTransition] = useTransition();
	const [{ q, available }, setFilters] = useQueryStates(
		{
			q: parseAsString.withDefault(""),
			available: parseAsString.withDefault(""),
			page: parseAsString,
		},
		{ shallow: false, startTransition },
	);
	const viewedRef = useRef(false);
	const onlyAvailable = available === "1";
	const isFiltered = Boolean(q) || onlyAvailable || page > 1;

	useEffect(() => {
		if (viewedRef.current) return;
		viewedRef.current = true;
		trackEvent("career_corner_viewed", { mentor_count: total });
	}, [total]);

	useEffect(() => {
		const searchTerm = q.trim();
		if (!searchTerm) return;

		const timeout = window.setTimeout(() => {
			trackEvent("mentor_search", {
				search_term: searchTerm.slice(0, 100),
				result_count: total,
				available_only: onlyAvailable,
			});
		}, 600);

		return () => window.clearTimeout(timeout);
	}, [total, onlyAvailable, q]);

	function clearFilters() {
		void setFilters({ q: null, available: null, page: null });
	}

	return (
		<>
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
				<SearchInput
					placeholder={searchPlaceholder}
					resetPageOnChange
					startTransition={startTransition}
					pending={isPending}
				/>
				<button
					type="button"
					onClick={() => {
						trackEvent("mentor_availability_filter_changed", {
							enabled: !onlyAvailable,
						});
						void setFilters({
							available: onlyAvailable ? null : "1",
							page: null,
						});
					}}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
						onlyAvailable
							? "bg-primary-500 text-white"
							: "bg-white border border-[#E0E0E0] text-[#636363] hover:border-primary-500 hover:text-primary-500",
					)}
				>
					{availableLabel}
				</button>
			</div>

			<div
				aria-busy={isPending}
				className={cn(
					"transition-opacity duration-200",
					isPending && "pointer-events-none opacity-50",
				)}
			>
				{mentors.length > 0 ? (
					<>
						<StaggerContainer className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{mentors.map((mentor) => (
								<StaggerItem key={mentor.id} immediate={isFiltered}>
									<HoverCard>
										<MentorCard mentor={mentor} />
									</HoverCard>
								</StaggerItem>
							))}
						</StaggerContainer>
						<Pagination
							page={page}
							pageSize={MENTOR_PAGE_SIZE}
							total={total}
							startTransition={startTransition}
						/>
					</>
				) : (
					<div className="mt-8">
						<EmptyState
							icon={SearchX}
							title="No mentors match that filter yet"
							description="Try a different name or role, or clear the filters to see everyone."
							action={
								<Button variant="outline" size="sm" onClick={clearFilters}>
									Clear filters
								</Button>
							}
						/>
					</div>
				)}
			</div>
		</>
	);
}
