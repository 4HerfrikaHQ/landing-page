import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { enrolments } from "./enrolments";

export type CertificatePartner = { name: string; logoUrl: string | null };

export const certificates = pgTable("certificates", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: text("code").notNull().unique(),
	enrolment_id: uuid("enrolment_id")
		.notNull()
		.unique()
		.references(() => enrolments.id, { onDelete: "cascade" }),
	learner_name: text("learner_name").notNull(),
	course_title: text("course_title").notNull(),
	issuer: text("issuer").notNull(),
	attribution: text("attribution"),
	partners: jsonb("partners").$type<CertificatePartner[]>().notNull(),
	completed_at: timestamp("completed_at", { withTimezone: true }).notNull(),
	issued_at: timestamp("issued_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	revoked_at: timestamp("revoked_at", { withTimezone: true }),
	revoked_reason: text("revoked_reason"),
}).enableRLS();

export type DbCertificate = typeof certificates.$inferSelect;
export type DbCertificateInsert = typeof certificates.$inferInsert;
