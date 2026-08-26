import { sql } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { mentors } from "./mentors";
import { users } from "./users";

export const MentorGoogleConnectionStatus = z.enum([
	"connected",
	"reauth_required",
	"revoked",
	"disconnected",
]);
export type MentorGoogleConnectionStatus = z.infer<
	typeof MentorGoogleConnectionStatus
>;

export const MentorGoogleReauthorizationState = z.enum([
	"not_required",
	"required",
]);
export type MentorGoogleReauthorizationState = z.infer<
	typeof MentorGoogleReauthorizationState
>;

export const MentorGoogleRevocationState = z.enum(["not_pending", "pending"]);
export type MentorGoogleRevocationState = z.infer<
	typeof MentorGoogleRevocationState
>;

/**
 * The only durable Google credential is refresh_token_ciphertext. Access
 * tokens and authorization codes are intentionally not represented here.
 */
export const mentorGoogleConnections = pgTable(
	"mentor_google_connections",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		mentor_id: uuid("mentor_id")
			.notNull()
			.references(() => mentors.id, { onDelete: "cascade" }),
		user_id: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		google_subject: text("google_subject").notNull(),
		google_email: text("google_email").notNull(),
		refresh_token_ciphertext: text("refresh_token_ciphertext"),
		granted_scopes: text("granted_scopes")
			.array()
			.notNull()
			.default(sql`ARRAY[]::text[]`),
		status: text("status")
			.notNull()
			.$type<MentorGoogleConnectionStatus>()
			.default("connected"),
		reauthorization_state: text("reauthorization_state")
			.notNull()
			.$type<MentorGoogleReauthorizationState>()
			.default("not_required"),
		revocation_state: text("revocation_state")
			.notNull()
			.$type<MentorGoogleRevocationState>()
			.default("not_pending"),
		revocation_error_code: text("revocation_error_code"),
		last_error_code: text("last_error_code"),
		connected_at: timestamp("connected_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		last_token_refresh_at: timestamp("last_token_refresh_at", {
			withTimezone: true,
		}),
		reauthorization_required_at: timestamp("reauthorization_required_at", {
			withTimezone: true,
		}),
		revoked_at: timestamp("revoked_at", { withTimezone: true }),
		disconnected_at: timestamp("disconnected_at", { withTimezone: true }),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updated_at: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		uniqueIndex("mentor_google_connections_mentor_id_unique").on(t.mentor_id),
		uniqueIndex("mentor_google_connections_user_id_unique").on(t.user_id),
		uniqueIndex("mentor_google_connections_google_subject_unique").on(
			t.google_subject,
		),
		index("mentor_google_connections_status_idx").on(t.status),
	],
);

/**
 * A state row is consumed atomically by the callback. Keeping it server-side
 * makes replay prevention work across instances and avoids trusting a client
 * cookie as the source of mentor identity.
 */
export const mentorGoogleOAuthStates = pgTable(
	"mentor_google_oauth_states",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		state_hash: text("state_hash").notNull(),
		mentor_id: uuid("mentor_id")
			.notNull()
			.references(() => mentors.id, { onDelete: "cascade" }),
		user_id: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		return_path: text("return_path").notNull(),
		code_verifier_ciphertext: text("code_verifier_ciphertext").notNull(),
		allow_account_change: boolean("allow_account_change")
			.notNull()
			.default(false),
		expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
		used_at: timestamp("used_at", { withTimezone: true }),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		uniqueIndex("mentor_google_oauth_states_state_hash_unique").on(
			t.state_hash,
		),
		index("mentor_google_oauth_states_expiry_idx").on(t.expires_at),
		index("mentor_google_oauth_states_mentor_id_idx").on(t.mentor_id),
	],
);

export type DbMentorGoogleConnection =
	typeof mentorGoogleConnections.$inferSelect;
export type DbMentorGoogleConnectionInsert =
	typeof mentorGoogleConnections.$inferInsert;
export type DbMentorGoogleOAuthState =
	typeof mentorGoogleOAuthStates.$inferSelect;
export type DbMentorGoogleOAuthStateInsert =
	typeof mentorGoogleOAuthStates.$inferInsert;
