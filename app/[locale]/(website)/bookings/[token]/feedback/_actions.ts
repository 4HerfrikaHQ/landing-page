"use server";

import { db } from "@/src/db";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { verifyBookingToken } from "@/src/lib/booking-tokens";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { eq, getTableColumns } from "drizzle-orm";
import { SubmitFeedbackSchema } from "./_schema";

export async function loadFeedbackContext(token: string) {
	const verified = verifyBookingToken(token);
	if (!verified.ok || verified.action !== "feedback") {
		return {
			ok: false as const,
			reason: verified.ok ? "wrong_action" : verified.reason,
		};
	}

	const [existing] = await db
		.select()
		.from(bookingFeedback)
		.where(eq(bookingFeedback.booking_id, verified.bookingId))
		.limit(1);
	if (existing) return { ok: false as const, reason: "already_submitted" };

	const [booking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, verified.bookingId))
		.limit(1);
	if (!booking) return { ok: false as const, reason: "not_found" };

	const [mentor] = await db
		.select({ ...getTableColumns(mentors), name: users.name })
		.from(mentors)
		.innerJoin(users, eq(users.id, mentors.user_id))
		.where(eq(mentors.id, booking.mentor_id))
		.limit(1);

	return { ok: true as const, booking, mentor };
}

export const submitFeedback = actionClient
	.schema(SubmitFeedbackSchema)
	.action(async ({ parsedInput }) => {
		const verified = verifyBookingToken(parsedInput.token);
		if (!verified.ok || verified.action !== "feedback") {
			throw new ActionError("Invalid link");
		}

		const [existing] = await db
			.select({ id: bookingFeedback.booking_id })
			.from(bookingFeedback)
			.where(eq(bookingFeedback.booking_id, verified.bookingId))
			.limit(1);
		if (existing) throw new ActionError("Feedback already submitted");

		await db.insert(bookingFeedback).values({
			booking_id: verified.bookingId,
			call_happened: parsedInput.call_happened,
			rating: parsedInput.rating ?? null,
			comment: parsedInput.comment || null,
			testimonial_consent: parsedInput.testimonial_consent,
		});

		if (
			parsedInput.call_happened === "mentor_no_show" ||
			parsedInput.call_happened === "mentee_no_show"
		) {
			await db
				.update(bookings)
				.set({ status: "no_show" })
				.where(eq(bookings.id, verified.bookingId));
		}

		return { ok: true };
	});
