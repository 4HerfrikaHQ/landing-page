"use client";

import { formatInTimeZone } from "date-fns-tz";
import { CalendarDays, ExternalLink, SearchX } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { AvatarCircle } from "@/components/dashboard/avatar-circle";
import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
	FilterBar,
	FilterPills,
	SearchInput,
} from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StaggerContainer } from "@/components/motion/stagger-container";
import { StaggerItem } from "@/components/motion/stagger-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { MentorBookingsResult } from "../_actions";
import { BookingTab } from "../_schema";

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
					<FilterPills
						label="Status"
						paramKey="status"
						options={STATUS_OPTIONS}
					/>
					<FilterPills label="Stage" paramKey="stage" options={STAGE_OPTIONS} />
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
}: {
	booking: Booking;
	feedback?: Feedback;
}) {
	const contactLine = [
		booking.mentee_country,
		booking.mentee_phone,
		booking.mentee_linkedin,
	]
		.filter(Boolean)
		.join(" · ");

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
						{booking.status !== "cancelled" ? (
							<Button
								href={booking.meet_url}
								isExternal
								variant="outline"
								size="sm"
							>
								<ExternalLink className="size-4" />
								Join Meet
							</Button>
						) : null}
					</div>
				</div>

				<div className="space-y-2 border-t border-border/60 pt-4 text-sm">
					<p className="whitespace-pre-wrap text-foreground">
						<span className="font-medium">Purpose:</span> {booking.purpose}
					</p>
					{booking.mentee_career_stage ? (
						<p className="text-muted-foreground">
							<span className="font-medium text-foreground">Career stage:</span>{" "}
							{CAREER_STAGE_LABELS[booking.mentee_career_stage] ??
								booking.mentee_career_stage}
						</p>
					) : null}
					{contactLine ? (
						<p className="text-muted-foreground">{contactLine}</p>
					) : null}
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
