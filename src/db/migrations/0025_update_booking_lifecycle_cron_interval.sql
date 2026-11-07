do $migration$
begin
	-- Supabase provides pg_cron. CI uses plain PostgreSQL, so it skips this
	-- platform-specific update when the extension is unavailable.
	if not exists (
		select 1 from pg_available_extensions where name = 'pg_cron'
	) then
		raise notice 'Skipping booking lifecycle cron update: pg_cron is unavailable';
		return;
	end if;

	execute $update_job$
		do $job$
		declare
			booking_job_id bigint;
			booking_job_command text;
		begin
			select jobid, command
			into booking_job_id, booking_job_command
			from cron.job
			where jobname = 'booking-lifecycle-every-15-minutes';

			if booking_job_id is null then
				raise exception 'Booking lifecycle cron job does not exist';
			end if;

			-- Cron job names cannot be edited, so replace the old job to keep the
			-- displayed name consistent with its interval.
			perform cron.unschedule(booking_job_id);
			perform cron.schedule(
				'booking-lifecycle-every-5-minutes',
				'*/5 * * * *',
				booking_job_command
			);
		end
		$job$;
	$update_job$;
end
$migration$;
