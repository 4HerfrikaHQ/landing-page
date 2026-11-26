import "server-only";
import { db, schema } from "@/src/db";
import { and, desc, eq, gte, isNotNull, ne, sql } from "drizzle-orm";

const MAX_TESTIMONIALS = 3;
const MIN_TESTIMONIAL_RATING = 4;

export type MentorTestimonial = {
	bookingId: string;
	comment: string;
	rating: number;
	menteeFirstName: string;
};

export async function getMentorTestimonials(
	mentorId: string,
): Promise<MentorTestimonial[]> {
	const { bookings, bookingFeedback } = schema;
	const rows = await db
		.select({
			bookingId: bookings.id,
			comment: bookingFeedback.comment,
			rating: bookingFeedback.rating,
			menteeName: bookings.mentee_name,
		})
		.from(bookingFeedback)
		.innerJoin(bookings, eq(bookings.id, bookingFeedback.booking_id))
		.where(
			and(
				eq(bookings.mentor_id, mentorId),
				eq(bookingFeedback.testimonial_consent, true),
				eq(bookingFeedback.call_happened, "yes"),
				gte(bookingFeedback.rating, MIN_TESTIMONIAL_RATING),
				isNotNull(bookingFeedback.comment),
				ne(sql`btrim(${bookingFeedback.comment})`, ""),
			),
		)
		.orderBy(desc(bookingFeedback.created_at))
		.limit(MAX_TESTIMONIALS);

	return rows.flatMap((row) => {
		const comment = row.comment?.trim();
		const menteeFirstName = row.menteeName.trim().split(/\s+/)[0];
		if (!comment || row.rating === null || !menteeFirstName) return [];
		return [
			{
				bookingId: row.bookingId,
				comment,
				rating: row.rating,
				menteeFirstName,
			},
		];
	});
}
