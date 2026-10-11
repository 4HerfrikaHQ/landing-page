"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { CallHappened } from "@/src/db/schema/tables/booking-feedback";
import type { MentorAttendance } from "@/src/db/schema/tables/bookings";
import { isAttendanceDisputed } from "@/src/lib/booking-rules";
import { formatInTimeZone } from "date-fns-tz";
import type { ReactNode } from "react";
import type { AdminBookingRow } from "../_actions";
import { OutcomeButtons } from "./outcome-buttons";

export function BookingDetailSheet({
	booking,
	open,
	onOpenChange,
}: {
	booking: AdminBookingRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const canSetOutcome =
		booking.start_at < new Date() && booking.status !== "cancelled";
	const answers = {
		mentor: booking.mentor_attendance,
		mentee: booking.mentee_call_happened,
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col overflow-y-auto px-4 sm:max-w-xl! sm:px-6">
				<SheetHeader className="px-0">
					<SheetTitle>Booking details</SheetTitle>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-7 pb-6">
					<div className="flex flex-wrap items-center gap-3">
						<StatusBadge status={booking.status} />
						<span className="text-sm text-muted-foreground">
							Created {formatDate(booking.created_at, booking.mentee_timezone)}
						</span>
					</div>

					<Section title="Session">
						<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
							<Field label="When" full>
								{formatInTimeZone(
									booking.start_at,
									booking.mentee_timezone,
									"EEEE, MMM d, yyyy · HH:mm zzz",
								)}
							</Field>
							<Field label="Mentor">{booking.mentor_name}</Field>
							<Field label="Timezone">{booking.mentee_timezone}</Field>
							<Field label="Reschedules">{booking.reschedule_count}</Field>
							<Field label="Calendar host">
								{booking.hosting_mode === "mentor_google"
									? "Mentor calendar"
									: "4Herfrika calendar"}
							</Field>
						</dl>
					</Section>

					<Section title="Mentee">
						<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
							<Field label="Name">{booking.mentee_name}</Field>
							<Field label="Email">
								<a
									href={`mailto:${booking.mentee_email}`}
									className="break-all text-primary-500 hover:underline"
								>
									{booking.mentee_email}
								</a>
							</Field>
							{booking.mentee_phone ? (
								<Field label="Phone / WhatsApp">{booking.mentee_phone}</Field>
							) : null}
							{booking.mentee_country ? (
								<Field label="Country">{booking.mentee_country}</Field>
							) : null}
							{booking.mentee_career_stage ? (
								<Field label="Career stage">
									<span className="capitalize">
										{booking.mentee_career_stage.replace(/_/g, " ")}
									</span>
								</Field>
							) : null}
							{booking.mentee_gender ? (
								<Field label="Gender">
									<span className="capitalize">
										{booking.mentee_gender.replace(/_/g, " ")}
									</span>
								</Field>
							) : null}
							{booking.mentee_linkedin ? (
								<Field label="LinkedIn / portfolio" full>
									<a
										href={booking.mentee_linkedin}
										target="_blank"
										rel="noreferrer"
										className="break-all text-primary-500 hover:underline"
									>
										{booking.mentee_linkedin}
									</a>
								</Field>
							) : null}
						</dl>
					</Section>

					<Section title="What they want to discuss">
						<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
							{booking.purpose}
						</p>
					</Section>

					{booking.end_at < new Date() && booking.status !== "cancelled" ? (
						<Section title="Attendance">
							{isAttendanceDisputed(answers) ? (
								<p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
									Disputed: the mentor and mentee gave different answers.
								</p>
							) : null}
							{booking.outcome_set_by_admin_at ? (
								<p className="text-sm text-muted-foreground">
									Status set by an admin{" "}
									{formatDate(
										booking.outcome_set_by_admin_at,
										booking.mentee_timezone,
									)}
									. New answers won't change it.
								</p>
							) : null}
							<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
								<Field label="Mentor says">
									{booking.mentor_attendance
										? MENTOR_ANSWERS[booking.mentor_attendance]
										: "No answer yet"}
								</Field>
								<Field label="Mentee says">
									{booking.mentee_call_happened
										? MENTEE_ANSWERS[booking.mentee_call_happened]
										: "No answer yet"}
								</Field>
							</dl>
						</Section>
					) : null}

					{booking.status === "cancelled" ? (
						<Section title="Cancellation">
							<div className="rounded-2xl border border-border/60 bg-muted/50 p-4">
								<p className="text-sm font-medium text-foreground">
									{booking.cancelled_at
										? `Cancelled ${formatDate(booking.cancelled_at, booking.mentee_timezone)}`
										: "Cancelled"}
								</p>
								<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
									{booking.cancel_reason || "No reason was provided."}
								</p>
							</div>
						</Section>
					) : null}
				</div>

				{canSetOutcome ? (
					<div className="sticky bottom-0 -mx-4 flex items-center border-t border-border/60 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
						<OutcomeButtons booking={booking} />
					</div>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

const MENTOR_ANSWERS: Record<MentorAttendance, string> = {
	attended: "Mentee joined",
	no_show: "Mentee didn't show",
};

const MENTEE_ANSWERS: Record<CallHappened, string> = {
	yes: "Call happened",
	mentor_no_show: "Mentor didn't show",
	mentee_no_show: "Mentee didn't make it",
	rescheduled_externally: "Rescheduled outside the platform",
};

function formatDate(date: Date, timezone: string) {
	return formatInTimeZone(date, timezone, "MMM d, yyyy · HH:mm zzz");
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
