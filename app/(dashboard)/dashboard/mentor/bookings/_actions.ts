"use server";

import { and, asc, desc, eq, gte, inArray, lt } from "drizzle-orm";
import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";

export async function loadMentorBookings() {
	const user = await currentDbUser();
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.user_id, user.id))
		.limit(1);
	if (!mentor) {
		return {
			ok: false as const,
			reason: "no_mentor_profile" as const,
		};
	}

	const now = new Date();
	const [upcoming, past] = await Promise.all([
		db
			.select()
			.from(bookings)
			.where(
				and(
					eq(bookings.mentor_id, mentor.id),
					gte(bookings.start_at, now),
				),
			)
			.orderBy(asc(bookings.start_at)),
		db
			.select()
			.from(bookings)
			.where(
				and(eq(bookings.mentor_id, mentor.id), lt(bookings.start_at, now)),
			)
			.orderBy(desc(bookings.start_at))
			.limit(50),
	]);

	const allBookingIds = [
		...upcoming.map((b) => b.id),
		...past.map((b) => b.id),
	];
	const feedbackRows = allBookingIds.length
		? await db
				.select()
				.from(bookingFeedback)
				.where(inArray(bookingFeedback.booking_id, allBookingIds))
		: [];

	const feedbackByBooking = Object.fromEntries(
		feedbackRows.map((f) => [f.booking_id, f]),
	);

	return { ok: true as const, upcoming, past, feedbackByBooking };
}
