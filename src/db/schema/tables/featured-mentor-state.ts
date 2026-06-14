import { pgTable, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { mentors } from "./mentors";

export const featuredMentorState = pgTable("featured_mentor_state", {
	id: uuid("id").primaryKey(),
	featured_mentor_id: uuid("featured_mentor_id").references(() => mentors.id, {
		onDelete: "set null",
	}),
	cycle_start_at: timestamp("cycle_start_at", { withTimezone: true }),
	cycle_end_at: timestamp("cycle_end_at", { withTimezone: true }),
	rotation_order: uuid("rotation_order")
		.array()
		.notNull()
		.default(sql`'{}'`),
	featured_this_cycle: uuid("featured_this_cycle")
		.array()
		.notNull()
		.default(sql`'{}'`),
	is_manual_override: boolean("is_manual_override").notNull().default(false),
	updated_at: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type DbFeaturedMentorState = typeof featuredMentorState.$inferSelect;
export type DbFeaturedMentorStateInsert =
	typeof featuredMentorState.$inferInsert;
