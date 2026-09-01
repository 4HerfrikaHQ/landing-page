CREATE TABLE "action_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"action" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "action_links_token_hash_unique" ON "action_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "action_links_expiry_idx" ON "action_links" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "action_links_action_resource_idx" ON "action_links" USING btree ("action","resource_id");