ALTER TABLE "mentor_applications" ALTER COLUMN "position" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mentor_applications" ALTER COLUMN "motivation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mentors" ALTER COLUMN "position" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mentor_applications" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "mentor_applications" ADD COLUMN "cv_path" text;