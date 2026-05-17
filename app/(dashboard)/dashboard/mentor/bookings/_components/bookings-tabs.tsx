"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatInTimeZone } from "date-fns-tz";
import type { loadMentorBookings } from "../_actions";

type Loaded = Awaited<ReturnType<typeof loadMentorBookings>>;
type OkLoaded = Extract<Loaded, { ok: true }>;
type Booking = OkLoaded["upcoming"][number];
type Feedback = OkLoaded["feedbackByBooking"][string];

export function BookingsTabs({
	upcoming,
	past,
	feedbackByBooking,
}: {
	upcoming: Booking[];
	past: Booking[];
	feedbackByBooking: Record<string, Feedback>;
}) {
	return (
		<Tabs defaultValue="upcoming">
			<TabsList>
				<TabsTrigger value="upcoming">
					Upcoming ({upcoming.length})
				</TabsTrigger>
				<TabsTrigger value="past">Past ({past.length})</TabsTrigger>
			</TabsList>
			<TabsContent value="upcoming">
				<BookingList rows={upcoming} />
			</TabsContent>
			<TabsContent value="past">
				<BookingList
					rows={past}
					feedbackByBooking={feedbackByBooking}
					showFeedback
				/>
			</TabsContent>
		</Tabs>
	);
}

function BookingList({
	rows,
	feedbackByBooking,
	showFeedback,
}: {
	rows: Booking[];
	feedbackByBooking?: Record<string, Feedback>;
	showFeedback?: boolean;
}) {
	if (rows.length === 0) {
		return <p className="mt-4 text-sm text-gray-500">Nothing here yet.</p>;
	}
	return (
		<div className="mt-4 space-y-3">
			{rows.map((b) => {
				const fb = showFeedback ? feedbackByBooking?.[b.id] : undefined;
				return (
					<article
						key={b.id}
						className="rounded-lg border p-4 bg-white"
					>
						<header className="flex items-start justify-between gap-3">
							<div>
								<p className="font-medium text-gray-900">
									{b.mentee_name}{" "}
									<span className="text-sm font-normal text-gray-500">
										{b.mentee_email}
									</span>
								</p>
								<p className="text-sm text-gray-500">
									{formatInTimeZone(
										b.start_at,
										b.mentee_timezone,
										"EEE, MMM d, yyyy 'at' HH:mm zzz",
									)}{" "}
									· {b.status}
								</p>
							</div>
							{b.status !== "cancelled" && (
								<a
									className="text-sm underline text-primary-500"
									href={b.meet_url}
									target="_blank"
									rel="noreferrer"
								>
									Meet link
								</a>
							)}
						</header>
						<p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
							<strong>Purpose:</strong> {b.purpose}
						</p>
						{(b.mentee_phone ||
							b.mentee_linkedin ||
							b.mentee_country ||
							b.mentee_career_stage) && (
							<p className="mt-2 text-xs text-gray-500">
								{[
									b.mentee_country,
									b.mentee_career_stage,
									b.mentee_phone,
									b.mentee_linkedin,
								]
									.filter(Boolean)
									.join(" · ")}
							</p>
						)}
						{fb && (
							<div className="mt-3 rounded bg-gray-50 p-3 text-sm">
								<p className="text-gray-700">
									<strong>Feedback:</strong> {fb.call_happened}
									{fb.rating ? ` · ${fb.rating}/5` : ""}
								</p>
								{fb.comment && (
									<p className="mt-1 whitespace-pre-wrap text-gray-700">
										{fb.comment}
									</p>
								)}
							</div>
						)}
					</article>
				);
			})}
		</div>
	);
}
