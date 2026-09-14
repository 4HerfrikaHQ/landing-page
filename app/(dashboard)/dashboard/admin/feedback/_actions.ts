"use server";

import { db } from "@/src/db";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { and, avg, count, desc, eq } from "drizzle-orm";

interface FeedbackFilters {
	page?: number;
	pageSize?: number;
}

export async function getFeedbackForAdmin(filters: FeedbackFilters) {
	const { page = 1, pageSize = 50 } = filters;
	const where = eq(mentors.archived, false);

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				booking_id: bookingFeedback.booking_id,
				rating: bookingFeedback.rating,
				call_happened: bookingFeedback.call_happened,
				comment: bookingFeedback.comment,
				testimonial_consent: bookingFeedback.testimonial_consent,
				created_at: bookingFeedback.created_at,
				start_at: bookings.start_at,
				mentee_name: bookings.mentee_name,
				mentor_name: users.name,
			})
			.from(bookingFeedback)
			.innerJoin(bookings, eq(bookingFeedback.booking_id, bookings.id))
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.innerJoin(users, eq(mentors.user_id, users.id))
			.where(where)
			.orderBy(desc(bookingFeedback.created_at))
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		db
			.select({ total: count() })
			.from(bookingFeedback)
			.innerJoin(bookings, eq(bookingFeedback.booking_id, bookings.id))
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.where(where),
	]);

	return { rows, total };
}

export async function getFeedbackSummaryForAdmin() {
	const where = eq(mentors.archived, false);

	const [[overall], [{ withConsent }]] = await Promise.all([
		db
			.select({ responses: count(), avgRating: avg(bookingFeedback.rating) })
			.from(bookingFeedback)
			.innerJoin(bookings, eq(bookingFeedback.booking_id, bookings.id))
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.where(where),
		db
			.select({ withConsent: count() })
			.from(bookingFeedback)
			.innerJoin(bookings, eq(bookingFeedback.booking_id, bookings.id))
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.where(and(where, eq(bookingFeedback.testimonial_consent, true))),
	]);

	const avgRating = overall.avgRating ? Number(overall.avgRating) : null;

	return {
		responses: overall.responses,
		avgRating,
		testimonialConsent: withConsent,
	};
}

export type AdminFeedbackRow = Awaited<
	ReturnType<typeof getFeedbackForAdmin>
>["rows"][number];
