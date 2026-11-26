import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { enrolments } from "./enrolments";

export type QuizAnswers = Record<string, number>;

export const quizAttempts = pgTable(
	"quiz_attempts",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		enrolment_id: uuid("enrolment_id")
			.notNull()
			.references(() => enrolments.id, { onDelete: "cascade" }),
		lesson_id: text("lesson_id").notNull(),
		attempt_number: integer("attempt_number").notNull(),
		answers: jsonb("answers").$type<QuizAnswers>().notNull(),
		correct_count: integer("correct_count").notNull(),
		question_count: integer("question_count").notNull(),
		passed: boolean("passed").notNull(),
		submitted_at: timestamp("submitted_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		unique("quiz_attempts_enrolment_lesson_attempt_unique").on(
			t.enrolment_id,
			t.lesson_id,
			t.attempt_number,
		),
		index("quiz_attempts_enrolment_lesson_idx").on(
			t.enrolment_id,
			t.lesson_id,
			t.submitted_at,
		),
		check(
			"quiz_attempts_counts_valid",
			sql`${t.question_count} > 0 and ${t.correct_count} between 0 and ${t.question_count}`,
		),
	],
).enableRLS();

export type DbQuizAttempt = typeof quizAttempts.$inferSelect;
export type DbQuizAttemptInsert = typeof quizAttempts.$inferInsert;
