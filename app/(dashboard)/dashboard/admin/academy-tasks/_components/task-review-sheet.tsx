"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { attemptLabel, countryName } from "../_helpers";
import type { TaskQueueRow } from "../_queries";
import { LinkedText } from "./linked-text";
import { ReviewActions } from "./review-actions";

export function TaskReviewSheet({
	row,
	open,
	onOpenChange,
}: {
	row: TaskQueueRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				initialFocus={false}
				className="data-[side=right]:w-full! data-[side=right]:sm:w-1/2! data-[side=right]:sm:max-w-none! flex flex-col overflow-y-auto px-4 sm:px-6"
			>
				<SheetHeader className="px-0">
					<SheetTitle>{row.learnerName}</SheetTitle>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-6 pb-4">
					<div className="flex flex-wrap items-center gap-3">
						<StatusBadge status={row.status} />
						<span className="text-sm text-muted-foreground">
							Submitted {format(row.submittedAt, "MMM d, yyyy")}
						</span>
					</div>

					<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
						<Field label="Course">{row.courseTitle}</Field>
						<Field label="Task">{row.lessonTitle}</Field>
						<Field label="Country">{countryName(row.country)}</Field>
						<Field label="Attempt">{attemptLabel(row.attempt)}</Field>
						<TrackField track={row.track} />
					</dl>

					<Section title="Submission">
						<LinkedText text={row.body} />
					</Section>

					<ReviewOutcome row={row} />
					<EarlierAttempts previous={row.previous} />
				</div>

				<ActionsBar row={row} onDone={() => onOpenChange(false)} />
			</SheetContent>
		</Sheet>
	);
}

function TrackField({ track }: { track: TaskQueueRow["track"] }) {
	if (!track) return null;
	return (
		<Field label="Track">
			<span className="capitalize">{track}</span>
		</Field>
	);
}

function ReviewOutcome({ row }: { row: TaskQueueRow }) {
	if (row.status === "submitted") return null;
	const reviewer = row.reviewerName ?? "A reviewer";
	const reviewedOn = row.reviewedAt
		? `, ${format(row.reviewedAt, "MMM d, yyyy")}`
		: "";
	return (
		<Section title="Your review">
			<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
				{row.note ?? "No note was left."}
			</p>
			<p className="text-xs text-muted-foreground">
				{reviewer}
				{reviewedOn}
			</p>
		</Section>
	);
}

function EarlierAttempts({ previous }: { previous: TaskQueueRow["previous"] }) {
	if (previous.length === 0) return null;
	return (
		<Section title="Earlier attempts">
			<ul className="space-y-3">
				{previous.map((item) => (
					<li
						key={item.id}
						className="space-y-2 rounded-xl border border-border/60 p-3"
					>
						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span className="font-medium text-foreground">
								{attemptLabel(item.attempt)}
							</span>
							<span>{format(item.submittedAt, "MMM d, yyyy")}</span>
							<StatusBadge status={item.status} />
						</div>
						<LinkedText text={item.body} />
						<AttemptNote note={item.note} />
					</li>
				))}
			</ul>
		</Section>
	);
}

function AttemptNote({ note }: { note: string | null }) {
	if (!note) return null;
	return (
		<p className="whitespace-pre-wrap break-words border-l-2 border-border pl-3 text-sm text-muted-foreground">
			{note}
		</p>
	);
}

function ActionsBar({
	row,
	onDone,
}: {
	row: TaskQueueRow;
	onDone: () => void;
}) {
	if (row.status !== "submitted") return null;
	return (
		<div className="sticky bottom-0 -mx-4 border-t border-border/60 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
			<ReviewActions submissionId={row.id} onDone={onDone} />
		</div>
	);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div>
			<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</dt>
			<dd className="mt-1 text-sm text-foreground">{children}</dd>
		</div>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="space-y-2">
			<h4 className="text-xs font-semibold uppercase tracking-wide text-primary-500">
				{title}
			</h4>
			{children}
		</div>
	);
}
