"use server";

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { uploadMentorAvatar } from "@/src/db/actions/mentors";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { MinLeadHoursSchema } from "@/src/lib/booking-rules";
import { and, countDistinct, eq, gte, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMentorProfile(): Promise<
	DbMentorWithAvailability | undefined
> {
	const user = await currentDbUser();

	const mentor = await db.query.mentors.findFirst({
		where: eq(schema.mentors.user_id, user.id),
		with: { availability: true, user: { columns: { name: true } } },
	});
	if (!mentor) return undefined;
	return { ...mentor, name: mentor.user.name };
}

export async function updateMyProfile(
	formData: FormData,
): Promise<{ error?: string }> {
	const mentor = await getMentorProfile();
	if (!mentor) return { error: "Mentor profile not found." };

	const name = formData.get("name") as string;

	// Name lives on the user row; the rest on the mentor row. One transaction
	// so both land together.
	await db.transaction(async (tx) => {
		await tx
			.update(schema.mentors)
			.set({
				position: (formData.get("position") as string) || "",
				bio: (formData.get("bio") as string) || undefined,
				nickname: (formData.get("nickname") as string) || undefined,
				linkedin_url: (formData.get("linkedin_url") as string) || undefined,
			})
			.where(eq(schema.mentors.id, mentor.id));

		await tx
			.update(schema.users)
			.set({ name })
			.where(eq(schema.users.id, mentor.user_id));
	});

	revalidatePath("/dashboard/mentor");
	return {};
}

export async function getMyBookingNotice(): Promise<{ minLeadHours: number }> {
	const mentor = await getMentorProfile();
	if (!mentor) return { minLeadHours: 24 };
	const [row] = await db
		.select({ minLeadHours: mentorBookingSettings.min_lead_hours })
		.from(mentorBookingSettings)
		.where(eq(mentorBookingSettings.mentor_id, mentor.id))
		.limit(1);
	return { minLeadHours: row?.minLeadHours ?? 24 };
}

export async function updateMyBookingNotice(
	formData: FormData,
): Promise<{ error?: string }> {
	const mentor = await getMentorProfile();
	if (!mentor) return { error: "Mentor profile not found." };

	const parsed = MinLeadHoursSchema.safeParse(
		Number(formData.get("minLeadHours")),
	);
	if (!parsed.success) {
		return { error: "Enter a whole number of hours between 0 and 168." };
	}

	await db
		.update(mentorBookingSettings)
		.set({ min_lead_hours: parsed.data })
		.where(eq(mentorBookingSettings.mentor_id, mentor.id));

	revalidatePath("/dashboard/mentor/availability");
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
			meetUrl: bookings.meet_url,
		})
		.from(bookings)
		.where(
			and(
				eq(bookings.mentor_id, mentor.id),
				gte(bookings.start_at, now),
				ne(bookings.status, "cancelled"),
			),
		)
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
