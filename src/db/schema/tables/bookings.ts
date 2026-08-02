import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import type { Gender } from "./mentor-applications";
import { mentors } from "./mentors";

export const BookingStatus = z.enum([
	"confirmed",
	"cancelled",
	"completed",
	"no_show",
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const BookingHostingMode = z.enum(["org_google", "mentor_google"]);
export type BookingHostingMode = z.infer<typeof BookingHostingMode>;

export const CareerStage = z.enum([
	"student",
	"early_career",
	"mid_career",
	"founder",
	"other",
]);
export type CareerStage = z.infer<typeof CareerStage>;

export const bookings = pgTable(
	"bookings",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		mentor_id: uuid("mentor_id")
			.notNull()
			.references(() => mentors.id, { onDelete: "cascade" }),

		mentee_name: text("mentee_name").notNull(),
		mentee_email: text("mentee_email").notNull(),
		mentee_gender: text("mentee_gender").$type<Gender>(),
		purpose: text("purpose").notNull(),
		mentee_phone: text("mentee_phone"),
		mentee_linkedin: text("mentee_linkedin"),
		mentee_country: text("mentee_country"),
		mentee_career_stage: text("mentee_career_stage").$type<CareerStage>(),

		start_at: timestamp("start_at", { withTimezone: true }).notNull(),
		end_at: timestamp("end_at", { withTimezone: true }).notNull(),
		mentee_timezone: text("mentee_timezone").notNull(),

		meet_url: text("meet_url").notNull(),
		google_event_id: text("google_event_id").notNull(),
		hosting_mode: text("hosting_mode")
			.notNull()
			.$type<BookingHostingMode>()
			.default("org_google"),

		status: text("status")
			.notNull()
			.$type<BookingStatus>()
			.default("confirmed"),
		cancel_reason: text("cancel_reason"),
		reschedule_count: integer("reschedule_count").notNull().default(0),

		confirmation_sent_at: timestamp("confirmation_sent_at", {
			withTimezone: true,
		}),
		reminder_24h_sent_at: timestamp("reminder_24h_sent_at", {
			withTimezone: true,
		}),
		reminder_1h_sent_at: timestamp("reminder_1h_sent_at", {
			withTimezone: true,
		}),
		feedback_email_sent_at: timestamp("feedback_email_sent_at", {
			withTimezone: true,
		}),
		mentor_followup_sent_at: timestamp("mentor_followup_sent_at", {
			withTimezone: true,
		}),

		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
	},
	(t) => [
		index("bookings_mentor_start_idx").on(t.mentor_id, t.start_at),
		index("bookings_mentee_email_idx").on(t.mentee_email),
	],
);

export type DbBooking = typeof bookings.$inferSelect;
export type DbBookingInsert = typeof bookings.$inferInsert;
