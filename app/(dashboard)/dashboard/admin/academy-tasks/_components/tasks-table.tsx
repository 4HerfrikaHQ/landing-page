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
import type { TaskQueueRow } from "../_queries";
import { DEFAULT_QUEUE_STATUS } from "../_schema";
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

const COLUMNS = [
	"Learner",
	"Course and task",
	"Track",
	"Submitted",
	"Attempt",
	"Status",
];

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

			<QueueRows rows={rows} status={status} />

			<Pagination page={page} pageSize={pageSize} total={total} />
		</div>
	);
}

function QueueRows({
	rows,
	status,
}: {
	rows: TaskQueueRow[];
	status: TaskSubmissionStatus;
}) {
	if (rows.length === 0) {
		return (
			<EmptyState
				icon={ClipboardCheck}
				title={EMPTY_COPY[status].title}
				description={EMPTY_COPY[status].description}
			/>
		);
	}
	return (
		<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted">
						{COLUMNS.map((column) => (
							<TableHead
								key={column}
								className="font-medium text-muted-foreground"
							>
								{column}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TaskRow key={row.id} row={row} />
					))}
				</TableBody>
			</Table>
		</div>
	);
}
