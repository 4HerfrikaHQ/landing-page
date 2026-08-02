CREATE TABLE "mentor_google_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"google_subject" text NOT NULL,
	"google_email" text NOT NULL,
	"refresh_token_ciphertext" text,
	"granted_scopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" text DEFAULT 'connected' NOT NULL,
	"reauthorization_state" text DEFAULT 'not_required' NOT NULL,
	"revocation_state" text DEFAULT 'not_pending' NOT NULL,
	"revocation_error_code" text,
	"last_error_code" text,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_token_refresh_at" timestamp with time zone,
	"reauthorization_required_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"disconnected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_google_oauth_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_hash" text NOT NULL,
	"mentor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"return_path" text NOT NULL,
	"code_verifier_ciphertext" text NOT NULL,
	"allow_account_change" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentor_google_connections" ADD CONSTRAINT "mentor_google_connections_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_google_connections" ADD CONSTRAINT "mentor_google_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_google_oauth_states" ADD CONSTRAINT "mentor_google_oauth_states_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_google_oauth_states" ADD CONSTRAINT "mentor_google_oauth_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_google_connections_mentor_id_unique" ON "mentor_google_connections" USING btree ("mentor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_google_connections_user_id_unique" ON "mentor_google_connections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_google_connections_google_subject_unique" ON "mentor_google_connections" USING btree ("google_subject");--> statement-breakpoint
CREATE INDEX "mentor_google_connections_status_idx" ON "mentor_google_connections" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_google_oauth_states_state_hash_unique" ON "mentor_google_oauth_states" USING btree ("state_hash");--> statement-breakpoint
CREATE INDEX "mentor_google_oauth_states_expiry_idx" ON "mentor_google_oauth_states" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "mentor_google_oauth_states_mentor_id_idx" ON "mentor_google_oauth_states" USING btree ("mentor_id");