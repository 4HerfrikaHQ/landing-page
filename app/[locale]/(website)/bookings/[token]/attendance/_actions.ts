"use server";

import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { resolveActionLink } from "@/src/lib/action-links";
import { recordMentorAttendance } from "@/src/lib/booking-attendance";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { ConfirmAttendanceSchema } from "./_schema";

export async function loadAttendanceContext(token: string) {
	const verified = await resolveActionLink(token, "attendance");
	if (!verified.ok) return { ok: false as const };

	const [booking] = await db
		.select({
			mentee_name: bookings.mentee_name,
			start_at: bookings.start_at,
			mentee_timezone: bookings.mentee_timezone,
			mentor_attendance: bookings.mentor_attendance,
			status: bookings.status,
		})
		.from(bookings)
		.where(eq(bookings.id, verified.resourceId))
		.limit(1);
	if (!booking || booking.status === "cancelled") return { ok: false as const };

	return { ok: true as const, booking };
}

export const confirmAttendance = actionClient
	.schema(ConfirmAttendanceSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(parsedInput.token, "attendance");
		if (!verified.ok) throw new ActionError("This link isn't valid");
		await recordMentorAttendance(verified.resourceId, parsedInput.attendance);
		return { ok: true };
	});
