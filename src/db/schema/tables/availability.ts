import { pgTable, uuid, text, time } from "drizzle-orm/pg-core";
import { mentors } from "./mentors";

export type DayOfWeek =
	| "Monday"
	| "Tuesday"
	| "Wednesday"
	| "Thursday"
	| "Friday"
	| "Saturday"
	| "Sunday";

export const availability = pgTable("availability", {
	id: uuid("id").primaryKey().defaultRandom(),
	mentor_id: uuid("mentor_id")
		.notNull()
		.references(() => mentors.id, { onDelete: "cascade" }),
	day: text("day").notNull().$type<DayOfWeek>(),
	start_time: time("start_time").notNull(),
	end_time: time("end_time").notNull(),
	timezone: text("timezone").notNull(),
});

export type DbAvailability = typeof availability.$inferSelect;
export type DbAvailabilityInsert = typeof availability.$inferInsert;
