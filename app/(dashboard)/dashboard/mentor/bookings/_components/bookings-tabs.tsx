"use client";

import { formatInTimeZone } from "date-fns-tz";
import { CalendarDays, SearchX } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { AvatarCircle } from "@/components/dashboard/avatar-circle";
import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
	DashboardFilter,
	FilterBar,
	SearchInput,
} from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StaggerContainer } from "@/components/motion/stagger-container";
import { StaggerItem } from "@/components/motion/stagger-item";
import { cn } from "@/utils/cn";
import type { MentorBookingsResult } from "../_actions";
import { BookingTab } from "../_schema";
import { BookingActions } from "./booking-actions";

type Booking = MentorBookingsResult["rows"][number];
type Feedback = MentorBookingsResult["feedbackByBooking"][string];

const CAREER_STAGE_LABELS: Record<string, string> = {
	student: "Student",
	early_career: "Early career",
	mid_career: "Mid career",
	founder: "Founder",
	other: "Other",
};

const STATUS_OPTIONS = [
	{ value: "confirmed", label: "Confirmed" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "no_show", label: "No show" },
];

const STAGE_OPTIONS = Object.entries(CAREER_STAGE_LABELS).map(
	([value, label]) => ({ value, label }),
);

export function BookingsTabs({
	tab,
	rows,
	feedbackByBooking,
	upcomingCount,
	pastCount,
	page,
	pageSize,
	total,
	hasFilters,
	mentorSlug,
}: {
	tab: BookingTab;
	rows: Booking[];
	feedbackByBooking: Record<string, Feedback>;
	upcomingCount: number;
	pastCount: number;
	page: number;
	pageSize: number;
	total: number;
	hasFilters: boolean;
	mentorSlug: string;
}) {
	// Tab + page live in the URL; `shallow: false` re-runs the server query.
	const [, setNav] = useQueryStates(
		{ tab: parseAsStringEnum(BookingTab.options), page: parseAsString },
		{ shallow: false },
	);

	const tabOptions = [
		{
			value: BookingTab.enum.upcoming,
			label: "Upcoming",
			count: upcomingCount,
		},
		{ value: BookingTab.enum.past, label: "Past", count: pastCount },
	];

	const isUpcoming = tab === BookingTab.enum.upcoming;

	return (
		<div>
			<div className="flex gap-2 border-b border-border/60">
				{tabOptions.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => setNav({ tab: option.value, page: null })}
						className={cn(
							"-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
							tab === option.value
								? "border-primary-500 text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{option.label}
						<span className="ml-1.5 tabular-nums text-xs text-muted-foreground">
							{option.count}
						</span>
					</button>
				))}
			</div>

			<div className="mt-5">
				<FilterBar>
					<SearchInput placeholder="Search mentee name or email" />
					<DashboardFilter
						label="Status"
						paramKey="status"
						options={STATUS_OPTIONS}
					/>
					<DashboardFilter
						label="Stage"
						paramKey="stage"
						options={STAGE_OPTIONS}
					/>
				</FilterBar>
			</div>

			{rows.length === 0 ? (
				hasFilters ? (
					<EmptyState
						className="mt-5"
						icon={SearchX}
						title="No bookings match your filters"
						description="Try a different search term or clear the filters above."
					/>
				) : (
					<EmptyState
						className="mt-5"
						icon={CalendarDays}
						title={
							isUpcoming ? "No upcoming sessions yet" : "No past sessions yet"
						}
						description={
							isUpcoming
								? "When a mentee books a call with you, it will show up here."
								: "Sessions appear here once they have taken place."
						}
					/>
				)
			) : (
				<>
					<StaggerContainer className="mt-5 space-y-3">
						{rows.map((booking) => (
							<StaggerItem key={booking.id}>
								<BookingCard
									booking={booking}
									feedback={
										isUpcoming ? undefined : feedbackByBooking[booking.id]
									}
									mentorSlug={mentorSlug}
									isUpcoming={isUpcoming}
								/>
							</StaggerItem>
						))}
					</StaggerContainer>

					<Pagination page={page} pageSize={pageSize} total={total} />
				</>
			)}
		</div>
	);
}

function BookingCard({
	booking,
	feedback,
	mentorSlug,
	isUpcoming,
}: {
	booking: Booking;
	feedback?: Feedback;
	mentorSlug: string;
	isUpcoming: boolean;
}) {
	return (
		<DataCard>
			<DataCardSection className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 items-start gap-3">
						<AvatarCircle name={booking.mentee_name} />
						<div className="min-w-0">
							<p className="truncate font-medium text-foreground">
								{booking.mentee_name}
							</p>
							<p className="truncate text-sm text-muted-foreground">
								{booking.mentee_email}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{formatInTimeZone(
									booking.start_at,
									booking.mentee_timezone,
									"EEE, MMM d, yyyy 'at' HH:mm zzz",
								)}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-3 sm:justify-end">
						<StatusBadge status={booking.status} />
						<BookingActions
							bookingId={booking.id}
							mentorSlug={mentorSlug}
							startAtUtc={booking.start_at.toISOString()}
							status={booking.status}
							isUpcoming={isUpcoming}
							meetUrl={
								isUpcoming && booking.status !== "cancelled"
									? booking.meet_url
									: undefined
							}
						/>
					</div>
				</div>

				<div className="space-y-4 border-t border-border/60 pt-4 text-sm">
					{booking.mentee_country || booking.mentee_phone ? (
						<dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
							{booking.mentee_country ? (
								<div>
									<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Country
									</dt>
									<dd className="mt-1 text-foreground">
										{booking.mentee_country}
									</dd>
								</div>
							) : null}
							{booking.mentee_phone ? (
								<div>
									<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Phone / WhatsApp
									</dt>
									<dd className="mt-1 text-foreground">
										{booking.mentee_phone}
									</dd>
								</div>
							) : null}
						</dl>
					) : null}
					{booking.mentee_career_stage ? (
						<p className="text-muted-foreground">
							<span className="font-medium text-foreground">Career stage:</span>{" "}
							{CAREER_STAGE_LABELS[booking.mentee_career_stage] ??
								booking.mentee_career_stage}
						</p>
					) : null}
					{booking.mentee_linkedin ? (
						<p className="break-all text-muted-foreground">
							<span className="font-medium text-foreground">LinkedIn:</span>{" "}
							{booking.mentee_linkedin}
						</p>
					) : null}
					<div className="space-y-2">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-primary-500">
							Purpose
						</h3>
						<p className="whitespace-pre-wrap text-foreground">
							{booking.purpose}
						</p>
					</div>
				</div>

				{feedback ? (
					<div className="rounded-xl bg-muted/50 p-4 text-sm">
						<p className="text-foreground">
							<span className="font-medium">Feedback:</span>{" "}
							{feedback.call_happened}
							{feedback.rating ? ` · ${feedback.rating}/5` : ""}
						</p>
						{feedback.comment ? (
							<p className="mt-1 whitespace-pre-wrap text-muted-foreground">
								{feedback.comment}
							</p>
						) : null}
					</div>
				) : null}
			</DataCardSection>
		</DataCard>
	);
}
