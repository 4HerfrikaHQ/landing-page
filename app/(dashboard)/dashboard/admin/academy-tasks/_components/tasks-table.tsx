"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { DashboardFilter, FilterBar } from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { TaskSubmissionStatus } from "@/src/db/schema/tables";
import { ClipboardCheck } from "lucide-react";
import { DEFAULT_QUEUE_STATUS } from "../_helpers";
import type { TaskQueueRow } from "../_queries";
import { TaskRow } from "./task-row";

const EMPTY_COPY: Record<
	TaskSubmissionStatus,
	{ title: string; description: string }
> = {
	submitted: {
		title: "Nothing waiting for review",
		description: "New task submissions will appear here, oldest first.",
	},
	needs_work: {
		title: "No submissions sent back",
		description: "Submissions you send back for changes will be listed here.",
	},
	complete: {
		title: "No completed submissions",
		description: "Submissions you mark complete will be listed here.",
	},
};

export function TasksTable({
	rows,
	status,
	waiting,
	page,
	pageSize,
	total,
}: {
	rows: TaskQueueRow[];
	status: TaskSubmissionStatus;
	waiting: number;
	page: number;
	pageSize: number;
	total: number;
}) {
	const options = [
		{ value: "submitted", label: "Waiting for review", count: waiting },
		{ value: "needs_work", label: "Needs work" },
		{ value: "complete", label: "Complete" },
	];

	return (
		<div>
			<div className="mb-6 space-y-4">
				<FilterBar>
					<DashboardFilter
						label="Status"
						paramKey="status"
						options={options}
						defaultValue={DEFAULT_QUEUE_STATUS}
						includeAll={false}
						resetPageOnChange
					/>
				</FilterBar>
			</div>

			{rows.length === 0 ? (
				<EmptyState
					icon={ClipboardCheck}
					title={EMPTY_COPY[status].title}
					description={EMPTY_COPY[status].description}
				/>
			) : (
				<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted">
								<TableHead className="font-medium text-muted-foreground">
									Learner
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Course and task
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Track
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Submitted
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Attempt
								</TableHead>
								<TableHead className="font-medium text-muted-foreground">
									Status
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TaskRow key={row.id} row={row} />
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Pagination page={page} pageSize={pageSize} total={total} />
		</div>
	);
}
