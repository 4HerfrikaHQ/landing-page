"use server";

import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import {
	claimActionLink,
	consumeActionLinks,
	releaseActionLinkClaim,
	resolveActionLink,
} from "@/src/lib/action-links";
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
		const claimed = await claimActionLink(parsedInput.token, "manage");
		if (!claimed.ok) {
			throw new ActionError("Invalid link");
		}
		let mutationCompleted = false;

		try {
			const [booking] = await db
				.select()
				.from(bookings)
				.where(eq(bookings.id, claimed.resourceId))
				.limit(1);
			if (!booking) throw new ActionError("Booking not found");
			if (booking.status === "cancelled") {
				mutationCompleted = true;
				await consumeActionLinks({
					action: "manage",
					resourceId: booking.id,
				});
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
			mutationCompleted = true;
			await consumeActionLinks({
				action: "manage",
				resourceId: booking.id,
			});
			return { ok: true };
		} catch (error) {
			if (!mutationCompleted) {
				await releaseActionLinkClaim(claimed.claim);
			}
			throw error;
		}
	});

export const rescheduleBooking = actionClient
	.schema(RescheduleBookingSchema)
	.action(async ({ parsedInput }) => {
		const claimed = await claimActionLink(parsedInput.token, "manage");
		if (!claimed.ok) throw new ActionError("Invalid link");
		let mutationCompleted = false;

		try {
			const { booking, mentor, mentorUser, mentorEmail, settings } =
				await loadRescheduleContext(claimed.resourceId);

			const result = await rescheduleBookingCore({
				booking,
				mentorId: mentor.id,
				mentorName: mentorUser.name,
				mentorSlug: mentor.slug,
				mentorEmail,
				sessionDurationMinutes: settings.session_duration_minutes,
				newStartUtc: new Date(parsedInput.newStartAtUtc),
			});
			mutationCompleted = true;
			await consumeActionLinks({
				action: "manage",
				resourceId: booking.id,
				excludeToken: result.manageToken,
			});
			return { ok: true };
		} catch (error) {
			if (!mutationCompleted) {
				await releaseActionLinkClaim(claimed.claim);
			}
			throw error;
		}
	});
