import { sql } from "drizzle-orm";
import {
	check,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { enrolments } from "./enrolments";

export const lessonProgress = pgTable(
	"lesson_progress",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		enrolment_id: uuid("enrolment_id")
			.notNull()
			.references(() => enrolments.id, { onDelete: "cascade" }),
		lesson_id: text("lesson_id").notNull(),
		furthest_position_seconds: integer("furthest_position_seconds")
			.notNull()
			.default(0),
		last_position_seconds: integer("last_position_seconds")
			.notNull()
			.default(0),
		completed_at: timestamp("completed_at", { withTimezone: true }),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		unique("lesson_progress_enrolment_lesson_unique").on(
			t.enrolment_id,
			t.lesson_id,
		),
		check(
			"lesson_progress_positions_non_negative",
			sql`${t.furthest_position_seconds} >= 0 and ${t.last_position_seconds} >= 0`,
		),
	],
).enableRLS();

export type DbLessonProgress = typeof lessonProgress.$inferSelect;
export type DbLessonProgressInsert = typeof lessonProgress.$inferInsert;
