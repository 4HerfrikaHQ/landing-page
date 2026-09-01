import {
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const ActionLinkAction = z.enum([
	"manage",
	"feedback",
	"mentor_onboard",
]);
export type ActionLinkAction = z.infer<typeof ActionLinkAction>;

export const actionLinks = pgTable(
	"action_links",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		token_hash: text("token_hash").notNull(),
		action: text("action").notNull().$type<ActionLinkAction>(),
		resource_id: uuid("resource_id").notNull(),
		expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
		used_at: timestamp("used_at", { withTimezone: true }),
		created_at: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		uniqueIndex("action_links_token_hash_unique").on(t.token_hash),
		index("action_links_expiry_idx").on(t.expires_at),
		index("action_links_action_resource_idx").on(t.action, t.resource_id),
	],
);

export type DbActionLink = typeof actionLinks.$inferSelect;
export type DbActionLinkInsert = typeof actionLinks.$inferInsert;
