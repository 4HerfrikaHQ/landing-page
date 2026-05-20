import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { mentors } from "./mentors";

export const bookingTokens = pgTable(
	"booking_tokens",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		mentor_id: uuid("mentor_id")
			.notNull()
			.references(() => mentors.id, { onDelete: "cascade" }),
		action: varchar("action", { length: 32 }).notNull(),
		expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
		used_at: timestamp("used_at", { withTimezone: true }),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [index("booking_tokens_mentor_idx").on(t.mentor_id)],
);

export type DbBookingToken = typeof bookingTokens.$inferSelect;
export type DbBookingTokenInsert = typeof bookingTokens.$inferInsert;
