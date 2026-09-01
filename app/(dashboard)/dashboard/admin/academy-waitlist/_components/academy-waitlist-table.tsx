"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import {
	FilterBar,
	DashboardFilter,
	SearchInput,
} from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { DbAcademyWaitlistEntry } from "@/src/db/schema/tables";
import { format } from "date-fns";
import { Inbox } from "lucide-react";

const ACADEMY_OPTIONS = [
	{ value: "tech", label: "Tech" },
	{ value: "business", label: "Business" },
	{ value: "climate", label: "Climate" },
];

const SORT_OPTIONS = [
	{ value: "newest", label: "Newest" },
	{ value: "oldest", label: "Oldest" },
];

type Academy = "tech" | "business" | "climate";

export function AcademyWaitlistTable({
	rows,
	academy,
	counts,
	page,
	pageSize,
	total,
}: {
	rows: DbAcademyWaitlistEntry[];
	academy?: Academy;
	counts: Partial<Record<Academy, number>>;
	page: number;
	pageSize: number;
	total: number;
}) {
	const optionsWithCounts = ACADEMY_OPTIONS.map((option) => ({
		...option,
		count: counts[option.value as Academy] ?? 0,
	}));

	return (
		<div>
			<div className="mb-6 space-y-4">
				<div className="flex flex-wrap items-center gap-2">
					<DashboardFilter
						label="Academy"
						paramKey="academy"
						defaultValue="all"
						allLabel="All academies"
						resetPageOnChange
						options={optionsWithCounts}
					/>
				</div>
				<FilterBar>
					<SearchInput
						placeholder="Search name, email or location…"
						resetPageOnChange
					/>
					<DashboardFilter
						label="Sort"
						paramKey="sort"
						defaultValue="newest"
						includeAll={false}
						resetPageOnChange
						options={SORT_OPTIONS}
					/>
				</FilterBar>
			</div>

			{rows.length === 0 ? (
				<EmptyState
					icon={Inbox}
					title={
						academy ? `No ${academy} Academy entries` : "No waitlist entries"
					}
					description="New Academy signups will appear here as people join the waitlist."
				/>
			) : (
				<div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<Table className="min-w-[760px]">
						<TableHeader>
							<TableRow className="bg-muted">
								<TableHead className="font-medium text-muted-foreground">
									Name
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Academy
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Email
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Phone
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Location
								</TableHead>
								<TableHead className="whitespace-nowrap font-medium text-muted-foreground">
									Joined
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((entry) => (
								<TableRow key={entry.id}>
									<TableCell className="font-medium text-foreground">
										{entry.name}
									</TableCell>
									<TableCell className="capitalize text-muted-foreground">
										{entry.academy}
									</TableCell>
									<TableCell className="text-muted-foreground">
										<a
											href={`mailto:${entry.email}`}
											className="hover:text-primary-500"
										>
											{entry.email}
										</a>
									</TableCell>
									<TableCell className="whitespace-nowrap text-muted-foreground">
										<a
											href={`tel:${entry.phone}`}
											className="hover:text-primary-500"
										>
											{entry.phone}
										</a>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{entry.location}
									</TableCell>
									<TableCell className="whitespace-nowrap text-muted-foreground">
										{format(entry.created_at, "MMM d, yyyy")}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Pagination page={page} pageSize={pageSize} total={total} />
		</div>
	);
}
