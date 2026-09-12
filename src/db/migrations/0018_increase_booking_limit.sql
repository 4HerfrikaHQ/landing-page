ALTER TABLE "mentor_booking_settings" ALTER COLUMN "max_active_bookings_per_mentee" SET DEFAULT 3;
--> statement-breakpoint
UPDATE "mentor_booking_settings"
SET "max_active_bookings_per_mentee" = 3
WHERE "max_active_bookings_per_mentee" = 1;
