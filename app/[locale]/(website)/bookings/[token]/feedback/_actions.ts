"use server";

import { db } from "@/src/db";
import { actionLinks } from "@/src/db/schema/tables/action-links";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { resolveActionLink } from "@/src/lib/action-links";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import { SubmitFeedbackSchema } from "./_schema";

export async function loadFeedbackContext(token: string) {
	const verified = await resolveActionLink(token, "feedback");
	if (!verified.ok) {
		return {
			ok: false as const,
			reason:
				verified.reason === "used" ? "already_submitted" : verified.reason,
		};
	}

	const [existing] = await db
		.select()
		.from(bookingFeedback)
		.where(eq(bookingFeedback.booking_id, verified.resourceId))
		.limit(1);
	if (existing) return { ok: false as const, reason: "already_submitted" };

	const [booking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, verified.resourceId))
		.limit(1);
	if (!booking) return { ok: false as const, reason: "not_found" };

	const [mentor] = await db
		.select({ ...getTableColumns(mentors), name: users.name })
		.from(mentors)
		.innerJoin(users, eq(users.id, mentors.user_id))
		.where(and(eq(mentors.id, booking.mentor_id), eq(mentors.archived, false)))
		.limit(1);
	if (!mentor) return { ok: false as const, reason: "not_found" };

	return { ok: true as const, booking, mentor };
}

export const submitFeedback = actionClient
	.schema(SubmitFeedbackSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(parsedInput.token, "feedback");
		if (!verified.ok) {
			throw new ActionError("Invalid link");
		}

		const [existing] = await db
			.select({ id: bookingFeedback.booking_id })
			.from(bookingFeedback)
			.where(eq(bookingFeedback.booking_id, verified.resourceId))
			.limit(1);
		if (existing) throw new ActionError("Feedback already submitted");

		await db.transaction(async (tx) => {
			const [booking] = await tx
				.select({ id: bookings.id })
				.from(bookings)
				.innerJoin(mentors, eq(mentors.id, bookings.mentor_id))
				.where(
					and(
						eq(bookings.id, verified.resourceId),
						eq(mentors.archived, false),
					),
				)
				.limit(1);
			if (!booking) throw new ActionError("Invalid link");

			await tx.insert(bookingFeedback).values({
				booking_id: verified.resourceId,
				call_happened: parsedInput.call_happened,
				rating: parsedInput.rating ?? null,
				comment: parsedInput.comment || null,
				testimonial_consent: parsedInput.testimonial_consent,
			});

			if (
				parsedInput.call_happened === "mentor_no_show" ||
				parsedInput.call_happened === "mentee_no_show"
			) {
				await tx
					.update(bookings)
					.set({ status: "no_show" })
					.where(eq(bookings.id, verified.resourceId));
			}

			await tx
				.update(actionLinks)
				.set({ used_at: new Date() })
				.where(
					and(
						eq(actionLinks.action, "feedback"),
						eq(actionLinks.resource_id, verified.resourceId),
						isNull(actionLinks.used_at),
					),
				);
		});

		return { ok: true };
	});
