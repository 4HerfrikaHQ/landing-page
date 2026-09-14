"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatInTimeZone } from "date-fns-tz";
import { Eye } from "lucide-react";
import { useState } from "react";
import type { AdminFeedbackRow } from "../_actions";
import { CALL_LABELS, FeedbackDetailSheet } from "./feedback-detail-sheet";

export function FeedbackRow({ feedback }: { feedback: AdminFeedbackRow }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TableRow onClick={() => setOpen(true)} className="cursor-pointer">
				<TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
					{formatInTimeZone(feedback.created_at, "UTC", "MMM d, yyyy")}
				</TableCell>
				<TableCell className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
					{feedback.mentor_name}
				</TableCell>
				<TableCell className="whitespace-nowrap px-4 py-3">
					{feedback.mentee_name}
				</TableCell>
				<TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
					{CALL_LABELS[feedback.call_happened] ?? feedback.call_happened}
				</TableCell>
				<TableCell className="whitespace-nowrap px-4 py-3">
					{feedback.rating ? `${feedback.rating}/5` : "—"}
				</TableCell>
				<TableCell className="w-full min-w-64 max-w-md px-4 py-3">
					{feedback.comment ? (
						<div className="space-y-1.5">
							<p className="line-clamp-2 break-words text-foreground">
								{feedback.comment}
							</p>
							{feedback.testimonial_consent ? (
								<span className="inline-flex items-center rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-500">
									Testimonial OK
								</span>
							) : null}
						</div>
					) : (
						<span className="text-muted-foreground">—</span>
					)}
				</TableCell>
				<TableCell className="px-4 py-3 text-right">
					<Button
						variant="ghost"
						size="sm"
						className="gap-1.5"
						onClick={(event) => {
							event.stopPropagation();
							setOpen(true);
						}}
					>
						<Eye className="size-4" />
						View
					</Button>
				</TableCell>
			</TableRow>

			<FeedbackDetailSheet
				feedback={feedback}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}
