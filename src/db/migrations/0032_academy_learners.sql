CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"enrolment_id" uuid NOT NULL,
	"learner_name" text NOT NULL,
	"course_title" text NOT NULL,
	"issuer" text NOT NULL,
	"attribution" text,
	"partners" jsonb NOT NULL,
	"signatories" jsonb NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	CONSTRAINT "certificates_code_unique" UNIQUE("code"),
	CONSTRAINT "certificates_enrolment_id_unique" UNIQUE("enrolment_id")
);
--> statement-breakpoint
ALTER TABLE "certificates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "enrolments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"course_id" text NOT NULL,
	"completion_policy" jsonb NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "enrolments_learner_course_unique" UNIQUE("learner_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "enrolments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"certificate_name" text NOT NULL,
	"country" text NOT NULL,
	"campus" text,
	"age_confirmed_at" timestamp with time zone NOT NULL,
	"age_confirmed_min" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learners_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "learners_certificate_name_length" CHECK (char_length(btrim("learners"."certificate_name")) between 1 and 120)
);
--> statement-breakpoint
ALTER TABLE "learners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrolment_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"furthest_position_seconds" integer DEFAULT 0 NOT NULL,
	"last_position_seconds" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_enrolment_lesson_unique" UNIQUE("enrolment_id","lesson_id"),
	CONSTRAINT "lesson_progress_positions_non_negative" CHECK ("lesson_progress"."furthest_position_seconds" >= 0 and "lesson_progress"."last_position_seconds" >= 0)
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrolment_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"correct_count" integer NOT NULL,
	"question_count" integer NOT NULL,
	"passed" boolean NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_attempts_enrolment_lesson_attempt_unique" UNIQUE("enrolment_id","lesson_id","attempt_number"),
	CONSTRAINT "quiz_attempts_counts_valid" CHECK ("quiz_attempts"."question_count" > 0 and "quiz_attempts"."correct_count" between 0 and "quiz_attempts"."question_count")
);
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "task_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrolment_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"track" text,
	"body" text NOT NULL,
	"file_path" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"facilitator_note" text,
	"reviewed_by" uuid,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "task_submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrolment_id_enrolments_id_fk" FOREIGN KEY ("enrolment_id") REFERENCES "public"."enrolments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrolments" ADD CONSTRAINT "enrolments_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrolment_id_enrolments_id_fk" FOREIGN KEY ("enrolment_id") REFERENCES "public"."enrolments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_enrolment_id_enrolments_id_fk" FOREIGN KEY ("enrolment_id") REFERENCES "public"."enrolments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_enrolment_id_enrolments_id_fk" FOREIGN KEY ("enrolment_id") REFERENCES "public"."enrolments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enrolments_course_idx" ON "enrolments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_enrolment_lesson_idx" ON "quiz_attempts" USING btree ("enrolment_id","lesson_id","submitted_at");--> statement-breakpoint
CREATE INDEX "task_submissions_enrolment_lesson_idx" ON "task_submissions" USING btree ("enrolment_id","lesson_id","submitted_at");--> statement-breakpoint
CREATE INDEX "task_submissions_status_idx" ON "task_submissions" USING btree ("status","submitted_at");