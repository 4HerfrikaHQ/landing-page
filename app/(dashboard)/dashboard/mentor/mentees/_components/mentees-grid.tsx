"use client";

import { formatInTimeZone } from "date-fns-tz";
import { Mail, SearchX, Users } from "lucide-react";
import { useQueryState } from "nuqs";

import { AvatarCircle } from "@/components/dashboard/avatar-circle";
import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
	FilterBar,
	DashboardFilter,
	SearchInput,
} from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import { StaggerContainer } from "@/components/motion/stagger-container";
import { StaggerItem } from "@/components/motion/stagger-item";
import type { MenteeRow } from "../_actions";

const SORT_OPTIONS = [
	{ value: "recent", label: "Most recent" },
	{ value: "sessions", label: "Most sessions" },
];

export function MenteesGrid({
	mentees,
	page,
	pageSize,
	total,
}: {
	mentees: MenteeRow[];
	page: number;
	pageSize: number;
	total: number;
}) {
	// Read-only: used to pick the right empty-state copy, not to filter.
	const [search] = useQueryState("q", { defaultValue: "" });
	const hasSearch = search.trim().length > 0;

	if (mentees.length === 0 && !hasSearch) {
		return (
			<EmptyState
				icon={Users}
				title="No mentees yet"
				description="Once a mentee books their first call, you will see them here with their session history."
			/>
		);
	}

	return (
		<div className="space-y-5">
			<FilterBar>
				<SearchInput placeholder="Search mentee name or email" />
				<DashboardFilter
					label="Sort"
					paramKey="sort"
					options={SORT_OPTIONS}
					includeAll={false}
					defaultValue="recent"
				/>
			</FilterBar>

			{mentees.length === 0 ? (
				<EmptyState
					icon={SearchX}
					title="No mentees match your search"
					description="Try a different name or email."
				/>
			) : (
				<StaggerContainer className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{mentees.map((mentee) => (
						<StaggerItem key={mentee.email}>
							<DataCard className="h-full">
								<DataCardSection className="flex h-full flex-col gap-3">
									<div className="flex items-center gap-3">
										<AvatarCircle name={mentee.name} size={44} />
										<div className="min-w-0">
											<p className="truncate font-medium text-foreground">
												{mentee.name}
											</p>
											<a
												href={`mailto:${mentee.email}`}
												className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground no-underline transition-colors hover:text-primary-500"
											>
												<Mail className="size-3.5 shrink-0" />
												<span className="truncate">{mentee.email}</span>
											</a>
										</div>
									</div>
									<div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-sm">
										<span className="font-medium text-foreground">
											{mentee.total} session{mentee.total === 1 ? "" : "s"}
										</span>
										<span className="text-muted-foreground">
											Last:{" "}
											{formatInTimeZone(
												new Date(mentee.lastAt),
												"UTC",
												"MMM d, yyyy",
											)}
										</span>
									</div>
								</DataCardSection>
							</DataCard>
						</StaggerItem>
					))}
				</StaggerContainer>
			)}

			<Pagination page={page} pageSize={pageSize} total={total} />
		</div>
	);
}
