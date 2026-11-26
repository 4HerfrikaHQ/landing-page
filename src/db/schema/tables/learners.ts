import { sql } from "drizzle-orm";
import {
	check,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const learners = pgTable(
	"learners",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		auth_user_id: uuid("auth_user_id").notNull().unique(),
		certificate_name: text("certificate_name").notNull(),
		country: text("country").notNull(),
		campus: text("campus"),
		age_confirmed_at: timestamp("age_confirmed_at", {
			withTimezone: true,
		}).notNull(),
		age_confirmed_min: integer("age_confirmed_min").notNull(),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		check(
			"learners_certificate_name_length",
			sql`char_length(btrim(${t.certificate_name})) between 1 and 120`,
		),
	],
).enableRLS();

export type DbLearner = typeof learners.$inferSelect;
export type DbLearnerInsert = typeof learners.$inferInsert;
