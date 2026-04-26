import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { users } from "./users";

export const mentors = pgTable("mentors", {
	id: uuid("id").primaryKey().defaultRandom(),
	user_id: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	bio: text("bio"),
	position: text("position").notNull(),
	image: text("image"),
	linkedin_url: text("linkedin_url"),
	booking_url: text("booking_url"),
	nickname: text("nickname"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbMentor = typeof mentors.$inferSelect;
export type DbMentorInsert = typeof mentors.$inferInsert;
