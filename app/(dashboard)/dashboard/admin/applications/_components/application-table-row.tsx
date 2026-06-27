"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import type { ApplicationRow } from "../_actions";
import { ApplicationDetailSheet } from "./application-detail-sheet";

export function ApplicationTableRow({
	application,
}: {
	application: ApplicationRow;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TableRow onClick={() => setOpen(true)} className="cursor-pointer">
				<TableCell className="font-medium text-foreground">
					{application.name}
				</TableCell>
				<TableCell className="text-muted-foreground">
					{application.email}
				</TableCell>
				<TableCell className="capitalize text-muted-foreground">
					{application.industry ?? "—"}
				</TableCell>
				<TableCell className="whitespace-nowrap text-sm text-muted-foreground">
					{format(application.created_at, "MMM d, yyyy")}
				</TableCell>
				<TableCell>
					<StatusBadge status={application.status} />
				</TableCell>
			</TableRow>

			<ApplicationDetailSheet
				application={application}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}
