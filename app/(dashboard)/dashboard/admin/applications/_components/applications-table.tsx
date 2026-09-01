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
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MentorApplicationStatus } from "@/src/db/schema/tables/mentor-applications";
import { Inbox } from "lucide-react";
import type { ApplicationRow } from "../_actions";
import { ApplicationTableRow } from "./application-table-row";

type Status = MentorApplicationStatus;

const SORT_OPTIONS = [
	{ value: "newest", label: "Newest" },
	{ value: "oldest", label: "Oldest" },
];

const TABS: { value: Status; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

const EMPTY_COPY: Record<Status, { title: string; description: string }> = {
	pending: {
		title: "No pending applications",
		description: "New mentor signups will appear here for review.",
	},
	approved: {
		title: "No approved applications",
		description: "Applications you approve will be listed here.",
	},
	rejected: {
		title: "No rejected applications",
		description: "Applications you decline will be listed here.",
	},
};

export function ApplicationsTable({
	rows,
	status,
	pendingCount,
	page,
	pageSize,
	total,
}: {
	rows: ApplicationRow[];
	status: Status;
	pendingCount: number;
	page: number;
	pageSize: number;
	total: number;
}) {
	const statusOptions = TABS.map((tab) => ({
		...tab,
		count: tab.value === "pending" ? pendingCount : undefined,
	}));

	return (
		<div>
			<div className="mb-6 space-y-4">
				<FilterBar>
					<SearchInput paramKey="q" placeholder="Search by name or email…" />
					<DashboardFilter
						label="Status"
						paramKey="status"
						options={statusOptions}
						defaultValue="pending"
						includeAll={false}
						resetPageOnChange
					/>
					<DashboardFilter
						label="Sort"
						paramKey="sort"
						options={SORT_OPTIONS}
						defaultValue="newest"
						includeAll={false}
					/>
				</FilterBar>
			</div>

			{rows.length === 0 ? (
				<EmptyState
					icon={Inbox}
					title={EMPTY_COPY[status].title}
					description={EMPTY_COPY[status].description}
				/>
			) : (
				<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted">
								<TableHead className="font-medium text-muted-foreground">
									Name
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Email
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Industry
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Submitted
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Status
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<ApplicationTableRow key={row.id} application={row} />
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Pagination page={page} pageSize={pageSize} total={total} />
		</div>
	);
}
