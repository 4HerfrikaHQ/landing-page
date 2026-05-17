"use server";

import { and, eq, gte, lt, ne } from "drizzle-orm";
import { db } from "@/src/db";
import { mentors } from "@/src/db/schema/tables/mentors";
import { availability } from "@/src/db/schema/tables/availability";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { actionClient, ActionError } from "@/src/lib/safe-action";
import { computeSlots } from "./_helpers";
import { ListSlotsSchema } from "./_schema";

export async function getMentorBySlug(slug: string) {
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(and(eq(mentors.slug, slug), eq(mentors.active, true)))
		.limit(1);
	return mentor ?? null;
}

export const listMentorSlots = actionClient
	.schema(ListSlotsSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await getMentorBySlug(parsedInput.mentorSlug);
		if (!mentor) throw new ActionError("Mentor not found");

		const [settings] = await db
			.select()
			.from(mentorBookingSettings)
			.where(eq(mentorBookingSettings.mentor_id, mentor.id))
			.limit(1);
		if (!settings) throw new ActionError("Mentor booking settings missing");

		const templates = await db
			.select()
			.from(availability)
			.where(eq(availability.mentor_id, mentor.id));

		const fromUtc = new Date(parsedInput.fromUtc);
		const toUtc = new Date(parsedInput.toUtc);

		const existing = await db
			.select({ startUtc: bookings.start_at, endUtc: bookings.end_at })
			.from(bookings)
			.where(
				and(
					eq(bookings.mentor_id, mentor.id),
					ne(bookings.status, "cancelled"),
					gte(bookings.start_at, fromUtc),
					lt(bookings.start_at, toUtc),
				),
			);

		const slots = computeSlots({
			availabilityTemplates: templates,
			existingBookings: existing,
			settings,
			fromUtc,
			toUtc,
			now: new Date(),
		});

		return {
			mentorId: mentor.id,
			mentorTimezone: templates[0]?.timezone ?? "UTC",
			slots,
		};
	});
