alter table "mentors" add column "search_text" text not null default '';--> statement-breakpoint
alter table "mentors" add column "search_document" tsvector not null default ''::tsvector;--> statement-breakpoint
create or replace function public.mentor_search_refresh() returns trigger
language plpgsql
set search_path = ''
as $$
declare
	mentor_name text;
begin
	select u.name into mentor_name from public.users u where u.id = new.user_id;
	new.search_text := concat_ws(' ', mentor_name, new.nickname, new.position);
	new.search_document :=
		setweight(to_tsvector('pg_catalog.english', concat_ws(' ', mentor_name, new.nickname)), 'A')
		|| setweight(to_tsvector('pg_catalog.english', coalesce(new.position, '')), 'B')
		|| setweight(to_tsvector('pg_catalog.english', coalesce(new.bio, '')), 'C');
	return new;
end;
$$;--> statement-breakpoint
create trigger mentors_search_refresh
	before insert or update of user_id, nickname, position, bio on public.mentors
	for each row execute function public.mentor_search_refresh();--> statement-breakpoint
create or replace function public.mentor_search_refresh_from_user() returns trigger
language plpgsql
set search_path = ''
as $$
begin
	update public.mentors set user_id = user_id where user_id = new.id;
	return null;
end;
$$;--> statement-breakpoint
create trigger users_mentor_search_refresh
	after update of name on public.users
	for each row when (old.name is distinct from new.name)
	execute function public.mentor_search_refresh_from_user();--> statement-breakpoint
update "mentors" set user_id = user_id;--> statement-breakpoint
create index "mentors_search_document_idx" on "mentors" using gin ("search_document");--> statement-breakpoint
create index "mentors_search_text_trgm_idx" on "mentors" using gin ("search_text" extensions.gin_trgm_ops);
