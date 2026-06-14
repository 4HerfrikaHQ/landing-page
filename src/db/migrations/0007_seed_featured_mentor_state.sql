-- Custom SQL migration file, put your code below! --

INSERT INTO "featured_mentor_state" ("id")
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT ("id") DO NOTHING;