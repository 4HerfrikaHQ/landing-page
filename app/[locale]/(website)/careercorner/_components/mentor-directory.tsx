"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import {
	Pagination,
	type PaginationLabels,
} from "@/components/dashboard/pagination";
import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Button } from "@/components/ui/button";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/utils/cn";
import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { MENTOR_PAGE_SIZE } from "../_utils/mentor-search";
import { useDirectoryTransition } from "./directory-transition";
import { MentorCard } from "./mentor-card";

const CHIP_CLASS =
	"inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

function EmptyDirectory({
	isFiltered,
	onClear,
}: {
	isFiltered: boolean;
	onClear: () => void;
}) {
	const t = useTranslations("careers");

	if (!isFiltered) {
		return (
			<EmptyState
				icon={SearchX}
				title={t("emptyNoneTitle")}
				description={t("emptyNoneDescription")}
			/>
		);
	}

	return (
		<EmptyState
			icon={SearchX}
			title={t("emptyFilteredTitle")}
			description={t("emptyFilteredDescription")}
			action={
				<Button variant="outline" size="sm" onClick={onClear}>
					{t("emptyClear")}
				</Button>
			}
		/>
	);
}

function MentorResults({
	mentors,
	total,
	page,
	isFiltered,
	onClear,
}: {
	mentors: DbMentorWithAvailability[];
	total: number;
	page: number;
	isFiltered: boolean;
	onClear: () => void;
}) {
	const t = useTranslations("careers");
	const { startTransition } = useDirectoryTransition();

	if (mentors.length === 0) {
		return <EmptyDirectory isFiltered={isFiltered} onClear={onClear} />;
	}

	const labels: PaginationLabels = {
		previous: t("pagePrevious"),
		next: t("pageNext"),
		goToPage: (target) => t("pageGoTo", { page: target }),
		range: (range) => t("pageRange", range),
	};

	return (
		<>
			<RevealGroup className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
				{mentors.map((mentor) => (
					<MentorCard key={mentor.id} mentor={mentor} />
				))}
			</RevealGroup>
			<Pagination
				page={page}
				pageSize={MENTOR_PAGE_SIZE}
				total={total}
				startTransition={startTransition}
				labels={labels}
				className="mt-10 justify-center sm:flex-col"
			/>
		</>
	);
}

export function MentorDirectory({
	mentors,
	total,
	page,
}: {
	mentors: DbMentorWithAvailability[];
	total: number;
	page: number;
}) {
	const t = useTranslations("careers");
	const { isPending, startTransition } = useDirectoryTransition();
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

	const setOnlyAvailable = (enabled: boolean) => {
		trackEvent("mentor_availability_filter_changed", { enabled });
		void setFilters({ available: enabled ? "1" : null, page: null });
	};

	const clearFilters = () => {
		void setFilters({ q: null, available: null, page: null });
	};

	return (
		<section id="mentors" className="scroll-mt-24 px-4 py-14 lg:px-20 lg:py-20">
			<div className="mx-auto max-w-6xl">
				<FadeIn className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
					<h2 className="text-[32px] font-bold leading-tight lg:text-5xl">
						{t("allFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("allSecond")}
						</em>
					</h2>
					<output className="text-[15px] text-muted-foreground tabular-nums">
						{t("mentorCount", { total })}
					</output>
				</FadeIn>
				<fieldset className="m-0 mt-6 flex min-w-0 flex-wrap gap-2 border-0 p-0">
					<legend className="sr-only">{t("filterLabel")}</legend>
					<button
						type="button"
						aria-pressed={!onlyAvailable}
						onClick={() => setOnlyAvailable(false)}
						className={cn(
							CHIP_CLASS,
							onlyAvailable
								? "border-border hover:border-primary-500"
								: "border-transparent bg-secondary-500 text-white",
						)}
					>
						{t("filterAll")}
					</button>
					<button
						type="button"
						aria-pressed={onlyAvailable}
						onClick={() => setOnlyAvailable(true)}
						className={cn(
							CHIP_CLASS,
							onlyAvailable
								? "border-primary-500 bg-surface-pink text-primary-500"
								: "border-border hover:border-primary-500",
						)}
					>
						<span
							aria-hidden="true"
							className="size-2 rounded-pill bg-emerald-600"
						/>
						{t("availableThisWeek")}
					</button>
				</fieldset>
				<div
					aria-busy={isPending}
					className={cn(
						"mt-8 transition-opacity duration-200",
						isPending && "pointer-events-none opacity-50",
					)}
				>
					<MentorResults
						mentors={mentors}
						total={total}
						page={page}
						isFiltered={isFiltered}
						onClear={clearFilters}
					/>
				</div>
			</div>
		</section>
	);
}
