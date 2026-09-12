ALTER TABLE "users"
	ADD CONSTRAINT "users_auth_user_id_auth_users_id_fk"
	FOREIGN KEY ("auth_user_id")
	REFERENCES "auth"."users"("id")
	ON DELETE CASCADE
	NOT VALID;
--> statement-breakpoint
ALTER TABLE "users"
	VALIDATE CONSTRAINT "users_auth_user_id_auth_users_id_fk";
