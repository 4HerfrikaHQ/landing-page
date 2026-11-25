import { db, schema } from "@/src/db";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { getBlogPosts } from "../blog/_actions";
import { getHeroMentors } from "../careercorner/_actions";
import { projects } from "../projects/_schema";
import {
	type HomeStory,
	firstName,
	hasStoryIdentity,
	mentorCreditName,
	newestFirst,
	plainExcerpt,
} from "./_helpers";
import {
	MIN_TESTIMONIAL_RATING,
	STORY_COUNT,
	TESTIMONIAL_LIMIT,
} from "./_schema";

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
	const [mentors, stories, testimonials] = await Promise.all([
		orEmpty("mentors", getHeroMentors),
		orEmpty("stories", getHomeStories),
		orEmpty("testimonials", getHomeTestimonials),
	]);
	return { mentors, stories, testimonials };
}

function projectStories(): HomeStory[] {
	return Object.entries(projects).map(([slug, project]) => ({
		id: `project-${slug}`,
		href: `/projects/${slug}`,
		title: project.title,
		category: null,
		isProject: true,
		date: project.date,
		imageUrl: project.cover,
		imageAlt: project.title,
		excerpt: plainExcerpt(project.content),
	}));
}

async function postStories(): Promise<HomeStory[]> {
	const posts = await getBlogPosts();
	return posts.filter(hasStoryIdentity).map((post) => ({
		id: post.id,
		href: `/blog/${post.uid}`,
		title: post.data.title ?? "",
		category:
			(post.data.category as { data?: { name?: string } }).data?.name ?? null,
		isProject: false,
		date: post.first_publication_date,
		imageUrl: post.data.cover_image?.url ?? null,
		imageAlt: post.data.cover_image?.alt ?? post.data.title ?? "",
		excerpt: post.data.description ?? "",
	}));
}

async function getHomeStories() {
	const posts = await postStories().catch((error: unknown) => {
		console.error("[home] stories failed", error);
		return [];
	});
	return newestFirst([...posts, ...projectStories()], STORY_COUNT);
}
