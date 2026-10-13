create schema if not exists extensions;--> statement-breakpoint
do $migration$
begin
	if not exists (select 1 from pg_extension where extname = 'pg_trgm') then
		create extension pg_trgm with schema extensions;
	elsif (select extnamespace::regnamespace::text from pg_extension where extname = 'pg_trgm') <> 'extensions' then
		alter extension pg_trgm set schema extensions;
	end if;
end
$migration$;
