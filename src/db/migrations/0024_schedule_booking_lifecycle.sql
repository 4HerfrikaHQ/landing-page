do $migration$
begin
	-- Supabase provides these extensions. CI uses plain PostgreSQL, so it
	-- intentionally skips this platform-specific setup when they are absent.
	if not exists (
		select 1 from pg_available_extensions where name = 'pg_cron'
	) or not exists (
		select 1 from pg_available_extensions where name = 'pg_net'
	) then
		raise notice 'Skipping booking lifecycle cron: pg_cron or pg_net is unavailable';
		return;
	end if;

	create extension if not exists pg_cron with schema pg_catalog;
	create extension if not exists pg_net with schema extensions;

	-- Use dynamic SQL so plain PostgreSQL does not resolve Supabase-only schemas
	-- while parsing this migration.
	execute $schedule$
		do $job$
		declare
			existing_job_id bigint;
		begin
			select jobid
			into existing_job_id
			from cron.job
			where jobname = 'booking-lifecycle-every-15-minutes';

			if existing_job_id is not null then
				perform cron.unschedule(existing_job_id);
			end if;

			perform cron.schedule(
				'booking-lifecycle-every-15-minutes',
				'*/15 * * * *',
				$cron$
				select net.http_get(
					url := secrets.site_url || '/api/cron/booking-emails',
					headers := jsonb_build_object(
						'Authorization', 'Bearer ' || secrets.cron_secret
					)
				) as request_id
				from (
					select
						max(decrypted_secret) filter (
							where name = 'booking_cron_site_url'
						) as site_url,
						max(decrypted_secret) filter (
							where name = 'booking_cron_secret'
						) as cron_secret
					from vault.decrypted_secrets
					where name in ('booking_cron_site_url', 'booking_cron_secret')
				) as secrets
				where secrets.site_url is not null
					and secrets.cron_secret is not null;
				$cron$
			);
		end
		$job$;
	$schedule$;
end
$migration$;
