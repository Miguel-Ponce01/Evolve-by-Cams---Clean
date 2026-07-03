-- 0009_auth_trigger.sql
-- Automatically syncs new Supabase Auth sign-ups with the public.profiles table.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, membership_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Member'),
    new.phone,
    'inactive'
  );
  return new;
end;
$$;

-- Trigger to run the function after a new user is inserted into auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
