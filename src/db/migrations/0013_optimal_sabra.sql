CREATE INDEX "mentors_user_id_idx" ON "mentors" USING btree ("user_id");--> statement-breakpoint
-- Backfill users.name from mentors.name before dropping the column. Profile
-- edits historically wrote mentors.name but not users.name, so mentors.name is
-- the more recent value; adopt it as the single source of truth.
UPDATE "users" SET "name" = "mentors"."name"
FROM "mentors"
WHERE "mentors"."user_id" = "users"."id"
  AND "mentors"."name" IS NOT NULL
  AND "mentors"."name" <> '';--> statement-breakpoint
ALTER TABLE "mentors" DROP COLUMN "name";
