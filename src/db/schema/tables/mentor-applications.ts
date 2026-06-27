import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";
import { users } from "./users";
import { mentors } from "./mentors";

export const MentorApplicationStatus = z.enum(["pending", "approved", "rejected"]);
export type MentorApplicationStatus = z.infer<typeof MentorApplicationStatus>;

export const Gender = z.enum(["female", "male", "non_binary", "prefer_not_to_say"]);
export type Gender = z.infer<typeof Gender>;

export const mentorApplications = pgTable("mentor_applications", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	phone: text("phone"),
	linkedin_url: text("linkedin_url"),
	country: text("country"),
	position: text("position"),
	bio: text("bio"),
	gender: text("gender").$type<Gender>(),
	expertise_areas: text("expertise_areas").array(),
	motivation: text("motivation"),
	industry: text("industry"),
	cv_path: text("cv_path"),
	status: text("status").notNull().$type<MentorApplicationStatus>().default("pending"),
	reviewed_by: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
	reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
	reject_reason: text("reject_reason"),
	mentor_id: uuid("mentor_id").references(() => mentors.id, { onDelete: "set null" }),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbMentorApplication = typeof mentorApplications.$inferSelect;
export type DbMentorApplicationInsert = typeof mentorApplications.$inferInsert;
