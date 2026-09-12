"use server";

import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { resolveActionLink } from "@/src/lib/action-links";
import {
	cancelBookingCore,
	rescheduleBookingCore,
} from "@/src/lib/booking-mutations";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { eq, getTableColumns } from "drizzle-orm";
import { loadRescheduleContext } from "./_helpers";
import { CancelBookingSchema, RescheduleBookingSchema } from "./_schema";

/** Server-only loader for the manage page. Verifies the token and returns the booking. */
export async function loadBookingFromToken(token: string) {
	const verified = await resolveActionLink(token, "manage");
	if (!verified.ok) {
		return {
			ok: false as const,
			reason: verified.reason,
		};
	}
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
		.where(eq(mentors.id, booking.mentor_id))
		.limit(1);
	return { ok: true as const, booking, mentor };
}

export const cancelBooking = actionClient
	.schema(CancelBookingSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(parsedInput.token, "manage");
		if (!verified.ok) {
			throw new ActionError("Invalid link");
		}
		const [booking] = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, verified.resourceId))
			.limit(1);
		if (!booking) throw new ActionError("Booking not found");
		if (booking.status === "cancelled") {
			return { ok: true };
		}

		const [mentorRow] = await db
			.select({ mentor: mentors, user: users })
			.from(mentors)
			.leftJoin(users, eq(users.id, mentors.user_id))
			.where(eq(mentors.id, booking.mentor_id))
			.limit(1);
		if (!mentorRow?.mentor) throw new ActionError("Mentor not found");

		await cancelBookingCore({
			booking,
			mentorName: mentorRow.user?.name ?? "",
			mentorSlug: mentorRow.mentor.slug,
			mentorEmail: mentorRow.user?.email ?? undefined,
			reason: parsedInput.reason,
		});
		return { ok: true };
	});

export const rescheduleBooking = actionClient
	.schema(RescheduleBookingSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(parsedInput.token, "manage");
		if (!verified.ok) throw new ActionError("Invalid link");
		const { booking, mentor, mentorUser, mentorEmail, settings } =
			await loadRescheduleContext(verified.resourceId);

		await rescheduleBookingCore({
			booking,
			mentorId: mentor.id,
			mentorName: mentorUser.name,
			mentorSlug: mentor.slug,
			mentorEmail,
			sessionDurationMinutes: settings.session_duration_minutes,
			newStartUtc: new Date(parsedInput.newStartAtUtc),
		});
		return { ok: true };
	});
