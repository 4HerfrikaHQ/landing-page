ALTER TABLE "mentors" ADD COLUMN "previous_slug" text;--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_previous_slug_unique" UNIQUE("previous_slug");--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_slug_format_check" CHECK ("mentors"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and "mentors"."slug" <> 'apply');--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_previous_slug_format_check" CHECK ("mentors"."previous_slug" is null or ("mentors"."previous_slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and "mentors"."previous_slug" <> 'apply'));