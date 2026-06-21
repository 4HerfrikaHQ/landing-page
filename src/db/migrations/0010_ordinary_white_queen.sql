ALTER TABLE "mentor_booking_settings" ALTER COLUMN "min_lead_hours" SET DEFAULT 24;
--> statement-breakpoint
UPDATE "mentor_booking_settings" SET "min_lead_hours" = 24 WHERE "min_lead_hours" = 2;