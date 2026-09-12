UPDATE "mentors"
SET "active" = false
WHERE "active" = true
	AND NOT EXISTS (
		SELECT 1
		FROM "mentor_google_connections"
		WHERE "mentor_google_connections"."mentor_id" = "mentors"."id"
			AND "mentor_google_connections"."status" = 'connected'
			AND "mentor_google_connections"."refresh_token_ciphertext" IS NOT NULL
			AND "mentor_google_connections"."reauthorization_state" = 'not_required'
			AND "mentor_google_connections"."revocation_state" = 'not_pending'
	);
