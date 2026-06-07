import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { mentors } from "./mentors";

export const mentorBookingSettings = pgTable("mentor_booking_settings", {
	mentor_id: uuid("mentor_id")
		.primaryKey()
		.references(() => mentors.id, { onDelete: "cascade" }),
	session_duration_minutes: integer("session_duration_minutes").notNull().default(30),
	min_lead_hours: integer("min_lead_hours").notNull().default(24),
	max_horizon_days: integer("max_horizon_days").notNull().default(30),
	buffer_minutes: integer("buffer_minutes").notNull().default(15),
	max_active_bookings_per_mentee: integer("max_active_bookings_per_mentee").notNull().default(1),
});

export type DbMentorBookingSettings = typeof mentorBookingSettings.$inferSelect;
export type DbMentorBookingSettingsInsert = typeof mentorBookingSettings.$inferInsert;
