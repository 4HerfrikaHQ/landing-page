"use server";

import { db } from "@/src/db";
import { actionLinks } from "@/src/db/schema/tables/action-links";
import { bookings } from "@/src/db/schema/tables/bookings";
import { resolveActionLink } from "@/src/lib/action-links";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { ConfirmAttendanceSchema } from "./_schema";

export async function loadAttendanceContext(token: string) {
	const verified = await resolveActionLink(token, "attendance");
	if (!verified.ok) return { ok: false as const, reason: verified.reason };

	const [booking] = await db
		.select({
			mentee_name: bookings.mentee_name,
			start_at: bookings.start_at,
			mentee_timezone: bookings.mentee_timezone,
		})
		.from(bookings)
		.where(eq(bookings.id, verified.resourceId))
		.limit(1);
	if (!booking) return { ok: false as const, reason: "malformed" as const };

	return { ok: true as const, booking };
}

export const confirmAttendance = actionClient
	.schema(ConfirmAttendanceSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(parsedInput.token, "attendance");
		if (!verified.ok) throw new ActionError("This link isn't valid");

		await db.transaction(async (tx) => {
			await tx
				.update(bookings)
				.set({
					status: parsedInput.attended ? "completed" : "no_show",
					updated_at: new Date(),
				})
				.where(
					and(
						eq(bookings.id, verified.resourceId),
						parsedInput.attended
							? eq(bookings.status, "confirmed")
							: inArray(bookings.status, ["confirmed", "completed"]),
					),
				);
			await tx
				.update(actionLinks)
				.set({ used_at: new Date() })
				.where(
					and(
						eq(actionLinks.action, "attendance"),
						eq(actionLinks.resource_id, verified.resourceId),
						isNull(actionLinks.used_at),
					),
				);
		});

		return { ok: true };
	});
