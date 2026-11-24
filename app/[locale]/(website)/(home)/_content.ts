import { db, schema } from "@/src/db";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { getBlogPosts } from "../blog/_actions";
import { getHeroMentors } from "../careercorner/_actions";
import { firstName, mentorCreditName } from "./_helpers";
import { STORY_COUNT } from "./_schema";

const TESTIMONIAL_LIMIT = 6;
const MIN_TESTIMONIAL_RATING = 4;

export type HomeTestimonial = {
	id: string;
	comment: string;
	menteeFirstName: string;
	mentorCredit: string;
	mentorSlug: string;
};

export async function getHomeTestimonials(): Promise<HomeTestimonial[]> {
	const { bookingFeedback, bookings, mentors, users } = schema;
	const rows = await db
		.select({
			id: bookingFeedback.booking_id,
			comment: bookingFeedback.comment,
			menteeName: bookings.mentee_name,
			mentorName: users.name,
			nickname: mentors.nickname,
			slug: mentors.slug,
		})
		.from(bookingFeedback)
		.innerJoin(bookings, eq(bookings.id, bookingFeedback.booking_id))
		.innerJoin(mentors, eq(mentors.id, bookings.mentor_id))
		.innerJoin(users, eq(users.id, mentors.user_id))
		.where(
			and(
				eq(bookingFeedback.testimonial_consent, true),
				eq(bookingFeedback.call_happened, "yes"),
				gte(bookingFeedback.rating, MIN_TESTIMONIAL_RATING),
				isNotNull(bookingFeedback.comment),
				sql`btrim(${bookingFeedback.comment}) <> ''`,
				eq(mentors.active, true),
				eq(mentors.archived, false),
			),
		)
		.orderBy(desc(bookingFeedback.created_at))
		.limit(TESTIMONIAL_LIMIT);

	return rows.map((row) => ({
		id: row.id,
		comment: (row.comment ?? "").trim(),
		menteeFirstName: firstName(row.menteeName),
		mentorCredit: mentorCreditName({
			name: row.mentorName,
			nickname: row.nickname,
		}),
		mentorSlug: row.slug,
	}));
}

async function orEmpty<T>(source: string, load: () => Promise<T[]>) {
	try {
		return await load();
	} catch (error) {
		console.error(`[home] ${source} failed`, error);
		return [];
	}
}

export async function getHomeContent() {
	const [mentors, posts, testimonials] = await Promise.all([
		orEmpty("mentors", getHeroMentors),
		orEmpty("stories", async () =>
			(await getBlogPosts()).slice(0, STORY_COUNT),
		),
		orEmpty("testimonials", getHomeTestimonials),
	]);
	return { mentors, posts, testimonials };
}
