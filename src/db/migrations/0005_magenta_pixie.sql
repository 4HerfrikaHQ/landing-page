CREATE TABLE "booking_feedback" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"rating" integer,
	"call_happened" text NOT NULL,
	"comment" text,
	"testimonial_consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"mentee_name" text NOT NULL,
	"mentee_email" text NOT NULL,
	"mentee_gender" text,
	"purpose" text NOT NULL,
	"mentee_phone" text,
	"mentee_linkedin" text,
	"mentee_country" text,
	"mentee_career_stage" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"mentee_timezone" text NOT NULL,
	"meet_url" text NOT NULL,
	"google_event_id" text NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"cancel_reason" text,
	"reschedule_count" integer DEFAULT 0 NOT NULL,
	"confirmation_sent_at" timestamp with time zone,
	"reminder_24h_sent_at" timestamp with time zone,
	"reminder_1h_sent_at" timestamp with time zone,
	"feedback_email_sent_at" timestamp with time zone,
	"mentor_followup_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mentor_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"linkedin_url" text,
	"country" text,
	"position" text NOT NULL,
	"bio" text,
	"gender" text,
	"expertise_areas" text[],
	"motivation" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"reject_reason" text,
	"mentor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentor_applications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "mentor_booking_settings" (
	"mentor_id" uuid PRIMARY KEY NOT NULL,
	"session_duration_minutes" integer DEFAULT 30 NOT NULL,
	"min_lead_hours" integer DEFAULT 24 NOT NULL,
	"max_horizon_days" integer DEFAULT 30 NOT NULL,
	"buffer_minutes" integer DEFAULT 15 NOT NULL,
	"max_active_bookings_per_mentee" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentors" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "mentors" SET "slug" = lower(regexp_replace(coalesce(nickname, name), '[^a-zA-Z0-9]+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "mentors" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_feedback" ADD CONSTRAINT "booking_feedback_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_applications" ADD CONSTRAINT "mentor_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_applications" ADD CONSTRAINT "mentor_applications_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_booking_settings" ADD CONSTRAINT "mentor_booking_settings_mentor_id_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_mentor_start_idx" ON "bookings" USING btree ("mentor_id","start_at");--> statement-breakpoint
CREATE INDEX "bookings_mentee_email_idx" ON "bookings" USING btree ("mentee_email");--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_slug_unique" UNIQUE("slug");