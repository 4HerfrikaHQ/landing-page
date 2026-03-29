-- Custom SQL migration file, put your code below! --
create or replace function public.handle_new_user()
returns trigger
set search_path to public
as $$
begin
    insert into public.users (auth_user_id, role)
    values (new.id, 'mentor');

    return new;
end;
$$
language plpgsql
security definer
;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
