import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { ActionError } from "@/src/lib/safe-action";
import { and, eq, lt } from "drizzle-orm";

/**
 * Force a past booking to `no_show`, overriding an auto-set "completed". Caller
 * is responsible for authorization (mentor ownership or admin role).
 */
export async function setBookingNoShow(bookingId: string): Promise<void> {
	const updated = await db
		.update(bookings)
		.set({ status: "no_show", updated_at: new Date() })
		.where(and(eq(bookings.id, bookingId), lt(bookings.start_at, new Date())))
		.returning({ id: bookings.id });
	if (updated.length === 0) {
		throw new ActionError("Booking not found or not yet past.");
	}
}
