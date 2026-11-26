DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.handle_new_user();
