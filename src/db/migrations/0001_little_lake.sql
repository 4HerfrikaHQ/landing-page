-- Custom SQL migration file, put your code below! --

create or replace function public.handle_new_user()
returns trigger
set search_path to public
as $$
begin
    insert into public.users (auth_user_id, role, email, name)
    values (
        new.id,
        'mentor',
        new.email,
        coalesce(new.raw_user_meta_data->>'name', new.email)
    );

    return new;
end;
$$
language plpgsql
security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();