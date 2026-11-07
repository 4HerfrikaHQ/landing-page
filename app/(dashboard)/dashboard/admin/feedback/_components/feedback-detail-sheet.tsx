"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { CallHappened } from "@/src/db/schema/tables/booking-feedback";
import { formatInTimeZone } from "date-fns-tz";
import type { ReactNode } from "react";
import type { AdminFeedbackRow } from "../_actions";

export const CALL_LABELS: Record<CallHappened, string> = {
	yes: "Call happened",
	mentor_no_show: "Mentor no-show",
	mentee_no_show: "Mentee no-show",
	rescheduled_externally: "Rescheduled externally",
};

function formatDate(date: Date) {
	return formatInTimeZone(date, "UTC", "MMM d, yyyy · HH:mm 'UTC'");
}

export function FeedbackDetailSheet({
	feedback,
	open,
	onOpenChange,
}: {
	feedback: AdminFeedbackRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col overflow-y-auto px-4 sm:max-w-xl! sm:px-6">
				<SheetHeader className="px-0">
					<SheetTitle>Session feedback</SheetTitle>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-7 pb-6">
					<Section title="Session">
						<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
							<Field label="Mentor">{feedback.mentor_name}</Field>
							<Field label="Mentee">{feedback.mentee_name}</Field>
							<Field label="Session date" full>
								{formatDate(feedback.start_at)}
							</Field>
							<Field label="Submitted">{formatDate(feedback.created_at)}</Field>
						</dl>
					</Section>

					<Section title="Feedback">
						<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
							<Field label="Outcome">
								{CALL_LABELS[feedback.call_happened] ?? feedback.call_happened}
							</Field>
							<Field label="Rating">
								{feedback.rating ? `${feedback.rating}/5` : "—"}
							</Field>
							<Field label="Testimonial consent">
								{feedback.testimonial_consent ? "Yes" : "No"}
							</Field>
						</dl>
					</Section>

					<Section title="Comment">
						{feedback.comment ? (
							<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
								{feedback.comment}
							</p>
						) : (
							<p className="text-sm text-muted-foreground">No comment left.</p>
						)}
					</Section>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function Field({
	label,
	children,
	full,
}: {
	label: string;
	children: ReactNode;
	full?: boolean;
}) {
	return (
		<div className={full ? "sm:col-span-2" : undefined}>
			<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</dt>
			<dd className="mt-1 text-sm text-foreground">{children}</dd>
		</div>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="space-y-3">
			<h3 className="text-xs font-semibold uppercase tracking-wide text-primary-500">
				{title}
			</h3>
			{children}
		</div>
	);
}
