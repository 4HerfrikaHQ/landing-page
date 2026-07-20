import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

export const Academy = z.enum(["tech", "business", "climate"]);
export type Academy = z.infer<typeof Academy>;

export const academyWaitlistEntries = pgTable(
	"academy_waitlist_entries",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		email: text("email").notNull(),
		phone: text("phone").notNull(),
		academy: text("academy").$type<Academy>().notNull(),
		location: text("location").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [unique("academy_waitlist_entries_email_academy_unique").on(table.email, table.academy)],
);

export type DbAcademyWaitlistEntry = typeof academyWaitlistEntries.$inferSelect;
