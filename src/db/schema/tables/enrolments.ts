import type { CompletionPolicy } from "@/app/[locale]/(website)/academy/_schema";
import {
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { learners } from "./learners";

export const enrolments = pgTable(
	"enrolments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		learner_id: uuid("learner_id")
			.notNull()
			.references(() => learners.id, { onDelete: "cascade" }),
		course_id: text("course_id").notNull(),
		completion_policy: jsonb("completion_policy")
			.$type<CompletionPolicy>()
			.notNull(),
		enrolled_at: timestamp("enrolled_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		completed_at: timestamp("completed_at", { withTimezone: true }),
	},
	(t) => [
		unique("enrolments_learner_course_unique").on(t.learner_id, t.course_id),
		index("enrolments_course_idx").on(t.course_id),
	],
).enableRLS();

export type DbEnrolment = typeof enrolments.$inferSelect;
export type DbEnrolmentInsert = typeof enrolments.$inferInsert;
