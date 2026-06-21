CREATE TABLE "featured_mentor_state" (
	"id" uuid PRIMARY KEY NOT NULL,
	"featured_mentor_id" uuid,
	"cycle_start_at" timestamp with time zone,
	"cycle_end_at" timestamp with time zone,
	"rotation_order" uuid[] DEFAULT '{}' NOT NULL,
	"featured_this_cycle" uuid[] DEFAULT '{}' NOT NULL,
	"is_manual_override" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "featured_mentor_state" ADD CONSTRAINT "featured_mentor_state_featured_mentor_id_mentors_id_fk" FOREIGN KEY ("featured_mentor_id") REFERENCES "public"."mentors"("id") ON DELETE set null ON UPDATE no action;