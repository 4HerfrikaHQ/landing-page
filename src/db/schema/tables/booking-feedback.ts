import { pgTable, uuid, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
import { bookings } from "./bookings";

export const CallHappened = z.enum([
	"yes",
	"mentor_no_show",
	"mentee_no_show",
	"rescheduled_externally",
]);
export type CallHappened = z.infer<typeof CallHappened>;

export const bookingFeedback = pgTable("booking_feedback", {
	booking_id: uuid("booking_id")
		.primaryKey()
		.references(() => bookings.id, { onDelete: "cascade" }),
	rating: integer("rating"),
	call_happened: text("call_happened").notNull().$type<CallHappened>(),
	comment: text("comment"),
	testimonial_consent: boolean("testimonial_consent").notNull().default(false),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbBookingFeedback = typeof bookingFeedback.$inferSelect;
export type DbBookingFeedbackInsert = typeof bookingFeedback.$inferInsert;
