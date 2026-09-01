import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import type { DbAvailability } from "./availability";
import { users } from "./users";

// A mentor's display name is the linked user's name (users.name) — not
// duplicated here. Read it by joining users; write it to users only.
export const mentors = pgTable(
	"mentors",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		user_id: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		bio: text("bio"),
		position: text("position"),
		image: text("image"),
		linkedin_url: text("linkedin_url"),
		nickname: text("nickname"),
		slug: text("slug").notNull().unique(),
		previous_slug: text("previous_slug").unique(),
		active: boolean("active").notNull().default(false),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		index("mentors_user_id_idx").on(t.user_id),
		check(
			"mentors_slug_format_check",
			sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and ${t.slug} <> 'apply'`,
		),
		check(
			"mentors_previous_slug_format_check",
			sql`${t.previous_slug} is null or (${t.previous_slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and ${t.previous_slug} <> 'apply')`,
		),
	],
);

export type DbMentor = typeof mentors.$inferSelect;
export type DbMentorInsert = typeof mentors.$inferInsert;

// Composite used across the app: a mentor row plus the joined display name and
// availability. `name` comes from users.name (see getMentorProfile / getMentors).
export type DbMentorWithAvailability = DbMentor & {
	name: string;
	availability: DbAvailability[];
};
