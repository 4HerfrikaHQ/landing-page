"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { attemptLabel, countryName } from "../_helpers";
import type { TaskQueueRow } from "../_queries";
import { TaskReviewSheet } from "./task-review-sheet";

export function TaskRow({ row }: { row: TaskQueueRow }) {
	const [open, setOpen] = useState(false);
	const track = row.track ?? "—";

	return (
		<>
			<TableRow onClick={() => setOpen(true)} className="cursor-pointer">
				<TableCell>
					<div className="font-medium text-foreground">{row.learnerName}</div>
					<div className="text-xs text-muted-foreground">
						{countryName(row.country)}
					</div>
				</TableCell>
				<TableCell>
					<div className="font-medium text-foreground">{row.lessonTitle}</div>
					<div className="text-xs text-muted-foreground">{row.courseTitle}</div>
				</TableCell>
				<TableCell className="capitalize text-muted-foreground">
					{track}
				</TableCell>
				<TableCell className="whitespace-nowrap text-sm text-muted-foreground">
					{format(row.submittedAt, "MMM d, yyyy")}
				</TableCell>
				<TableCell className="whitespace-nowrap text-sm text-muted-foreground">
					{attemptLabel(row.attempt)}
				</TableCell>
				<TableCell>
					<StatusBadge status={row.status} />
				</TableCell>
			</TableRow>

			<TaskReviewSheet row={row} open={open} onOpenChange={setOpen} />
		</>
	);
}
