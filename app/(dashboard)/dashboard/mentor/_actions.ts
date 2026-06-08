"use server";

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { uploadMentorAvatar } from "@/src/db/actions/mentors";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { bookings } from "@/src/db/schema/tables/bookings";
import { and, countDistinct, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMentorProfile(): Promise<
	DbMentorWithAvailability | undefined
> {
	const user = await currentDbUser();

	return db.query.mentors.findFirst({
		where: eq(schema.mentors.user_id, user.id),
		with: { availability: true },
	});
}

export async function updateMyProfile(
	formData: FormData,
): Promise<{ error?: string }> {
	const mentor = await getMentorProfile();
	if (!mentor) return { error: "Mentor profile not found." };

	await db
		.update(schema.mentors)
		.set({
			name: formData.get("name") as string,
			position: (formData.get("position") as string) || "",
			bio: (formData.get("bio") as string) || undefined,
			nickname: (formData.get("nickname") as string) || undefined,
			linkedin_url: (formData.get("linkedin_url") as string) || undefined,
		})
		.where(eq(schema.mentors.id, mentor.id));

	revalidatePath("/dashboard/mentor");
	return {};
}

export async function getMentorOverview() {
	const mentor = await getMentorProfile();
	if (!mentor) return null;

	const now = new Date();
	const weekAhead = new Date(now);
	weekAhead.setDate(weekAhead.getDate() + 7);

	const [counts] = await db
		.select({
			upcoming: sql<number>`count(*) filter (where ${bookings.start_at} >= ${now.toISOString()}::timestamptz and ${bookings.start_at} < ${weekAhead.toISOString()}::timestamptz and ${bookings.status} = 'confirmed')::int`,
			completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')::int`,
			total: sql<number>`count(*)::int`,
		})
		.from(bookings)
		.where(eq(bookings.mentor_id, mentor.id));

	const [{ mentees } = { mentees: 0 }] = await db
		.select({ mentees: countDistinct(bookings.mentee_email) })
		.from(bookings)
		.where(eq(bookings.mentor_id, mentor.id));

	const recent = await db
		.select({
			id: bookings.id,
			menteeName: bookings.mentee_name,
			menteeEmail: bookings.mentee_email,
			startAt: bookings.start_at,
			status: bookings.status,
		})
		.from(bookings)
		.where(and(eq(bookings.mentor_id, mentor.id), gte(bookings.start_at, now)))
		.orderBy(bookings.start_at)
		.limit(5);

	return {
		mentor,
		upcomingThisWeek: counts?.upcoming ?? 0,
		completed: counts?.completed ?? 0,
		total: counts?.total ?? 0,
		mentees: Number(mentees ?? 0),
		recent,
	};
}

export async function uploadMyImage(
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	try {
		const mentor = await getMentorProfile();
		if (!mentor) return { error: "Mentor profile not found." };
		const result = await uploadMentorAvatar(mentor.id, formData);
		if (!result.error) revalidatePath("/dashboard/mentor");
		return result;
	} catch (err) {
		return { error: String(err) };
	}
}
