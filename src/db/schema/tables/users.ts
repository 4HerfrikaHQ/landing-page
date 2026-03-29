import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";

export type UserRole = "super_admin" | "mentor";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	auth_user_id: uuid("auth_user_id").notNull().unique(),
	role: text("role").notNull().$type<UserRole>(),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbUser = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;
