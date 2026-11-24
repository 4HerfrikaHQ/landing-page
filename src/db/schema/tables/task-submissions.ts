import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";
import { enrolments } from "./enrolments";
import { users } from "./users";

export const TaskSubmissionStatus = z.enum([
	"submitted",
	"needs_work",
	"complete",
]);
export type TaskSubmissionStatus = z.infer<typeof TaskSubmissionStatus>;

export const taskSubmissions = pgTable(
	"task_submissions",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		enrolment_id: uuid("enrolment_id")
			.notNull()
			.references(() => enrolments.id, { onDelete: "cascade" }),
		lesson_id: text("lesson_id").notNull(),
		track: text("track"),
		body: text("body").notNull(),
		file_path: text("file_path"),
		status: text("status")
			.notNull()
			.$type<TaskSubmissionStatus>()
			.default("submitted"),
		facilitator_note: text("facilitator_note"),
		reviewed_by: uuid("reviewed_by").references(() => users.id, {
			onDelete: "set null",
		}),
		submitted_at: timestamp("submitted_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
	},
	(t) => [
		index("task_submissions_enrolment_lesson_idx").on(
			t.enrolment_id,
			t.lesson_id,
			t.submitted_at,
		),
		index("task_submissions_status_idx").on(t.status, t.submitted_at),
	],
).enableRLS();

export type DbTaskSubmission = typeof taskSubmissions.$inferSelect;
export type DbTaskSubmissionInsert = typeof taskSubmissions.$inferInsert;
