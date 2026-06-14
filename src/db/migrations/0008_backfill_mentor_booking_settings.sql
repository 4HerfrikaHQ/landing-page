-- Custom SQL migration file, put your code below! --

-- Backfill default booking settings for any mentor created before settings
-- creation was unified (e.g. via createMentor, which never inserted a row).
-- Relies on the column defaults to populate the non-PK columns. Idempotent: the
-- LEFT JOIN ... IS NULL guard only inserts for mentors that lack a row.
INSERT INTO "mentor_booking_settings" ("mentor_id")
SELECT m."id"
FROM "mentors" m
LEFT JOIN "mentor_booking_settings" s ON s."mentor_id" = m."id"
WHERE s."mentor_id" IS NULL;
