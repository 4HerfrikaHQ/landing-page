import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const emailUnsubscribes = pgTable("email_unsubscribes", {
	email: text("email").primaryKey(),
	created_at: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type DbEmailUnsubscribe = typeof emailUnsubscribes.$inferSelect;
export type DbEmailUnsubscribeInsert = typeof emailUnsubscribes.$inferInsert;
