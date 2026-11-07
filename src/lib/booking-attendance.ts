import { db } from "@/src/db";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import {
	type MentorAttendance,
	bookings,
} from "@/src/db/schema/tables/bookings";
import { attendanceStatus } from "@/src/lib/booking-rules";
import { ActionError } from "@/src/lib/safe-action";
import { and, eq, lt, ne } from "drizzle-orm";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function syncAttendanceStatus(tx: Tx, bookingId: string) {
	await tx
		.select({ id: bookings.id })
		.from(bookings)
		.where(eq(bookings.id, bookingId))
		.for("update");

	const [row] = await tx
		.select({
			status: bookings.status,
			overriddenAt: bookings.outcome_set_by_admin_at,
			mentor: bookings.mentor_attendance,
			mentee: bookingFeedback.call_happened,
		})
		.from(bookings)
		.leftJoin(bookingFeedback, eq(bookingFeedback.booking_id, bookings.id))
		.where(eq(bookings.id, bookingId))
		.limit(1);
	if (!row || row.status === "cancelled" || row.overriddenAt) return;

	const status = attendanceStatus(row);
	if (status === row.status) return;
	await tx
		.update(bookings)
		.set({ status, updated_at: new Date() })
		.where(eq(bookings.id, bookingId));
}

export async function recordMentorAttendance(
	bookingId: string,
	attendance: MentorAttendance,
) {
	await db.transaction(async (tx) => {
		const updated = await tx
			.update(bookings)
			.set({ mentor_attendance: attendance })
			.where(
				and(
					eq(bookings.id, bookingId),
					lt(bookings.start_at, new Date()),
					ne(bookings.status, "cancelled"),
				),
			)
			.returning({ id: bookings.id });
		if (updated.length === 0) {
			throw new ActionError("Booking not found, cancelled, or not yet past.");
		}
		await syncAttendanceStatus(tx, bookingId);
	});
}
